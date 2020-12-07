enum ProjectStatus { ACTIVE, FINISHED }


// Project Type
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) { }
}

//Project State
type Listener<T> = (items: T[]) => void;

class State<T>{
    protected listeners: Listener<T>[] = [];
    // register a listener
    addListener(listenerFunction: Listener<T>) {
        this.listeners.push(listenerFunction)
    }
}

// singleton object pattern
class ProjectState extends State<Project> {

    private projects: Project[] = [];

    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            `${Math.random().toString()}-${title}`,
            title,
            description,
            numOfPeople,
            ProjectStatus.ACTIVE
        );
        this.projects.push(newProject);

        // call all the listeners
        for (const listener of this.listeners) {
            // pass a copy of the array to prevent the original obj from getting mutated
            listener(this.projects.slice());
        }
    }


}

const projectState = ProjectState.getInstance();

// validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;

    }
    if (typeof validatableInput.value === 'string' && validatableInput.minLength != null && validatableInput.minLength) {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }
    if (typeof validatableInput.value === 'string' && validatableInput.maxLength != null && validatableInput.maxLength) {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
    }
    if (typeof validatableInput.value === 'number' && validatableInput.min != null) {
        isValid = isValid && validatableInput.value >= validatableInput.min
    }
    if (typeof validatableInput.value === 'number' && validatableInput.max != null) {
        isValid = isValid && validatableInput.value <= validatableInput.max
    }
    return isValid
}

// autobind decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjustDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            // this is what binds this to the function when this method is accesssed anywhere else
            const boundFucntion = originalMethod.bind(this);
            return boundFucntion
        }
    }
    return adjustDescriptor
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement>{

    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string,
    ) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        // create a document node / DocumentFragment with content of HTML template 
        const importedNode = document.importNode(this.templateElement.content, true);

        // assign this DocumentFragment to the element
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {

            this.element.id = newElementId;
        }

        // attach created Element using template to the dom using hostElement
        this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element)
    }

    abstract configure(): void;
    abstract renderContent(): void;

}

// ProjectList Class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super("project-list", "app", false, `${type}-projects`)
        this.assignedProjects = [];
        this.configure();
        this.renderContent();

    }

    configure() {
        // registering a listener to projectState
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                if (this.type === "active") {
                    return project.status === ProjectStatus.ACTIVE;
                }
                return project.status === ProjectStatus.FINISHED;
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects()
        })

    }

    renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }

    private renderProjects() {
        const listId = `${this.type}-projects-list`
        const listELement = (document.getElementById(listId)!) as HTMLUListElement;
        listELement.innerHTML = '';
        for (const project of this.assignedProjects) {
            const listItem = document.createElement("li");
            listItem.textContent = project.title;
            listELement.appendChild(listItem)
        }
    }

}

// Project Input Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super("project-input", "app", true, 'user-input')

        this.configure()
        this.titleInputElement = (document.getElementById('title')) as HTMLInputElement;
        this.descriptionInputElement = (document.getElementById('description')!) as HTMLInputElement;
        this.peopleInputElement = (document.getElementById('people')!) as HTMLInputElement;
    }

    configure() {
        // add event listeners
        this.element.addEventListener('submit', this.submitHandler)

    }

    renderContent() { }

    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput()
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people)
            this.clearUserInput()
        }
    }

    private getUserInput(): [string, string, number] | void {
        const title = this.titleInputElement.value.trim();
        const description = this.descriptionInputElement.value.trim();
        const people = this.peopleInputElement.value.trim();

        const titleValidabable: Validatable = {
            value: title,
            required: true
        }
        const descriptionValidabable: Validatable = {
            value: description,
            required: true,
            minLength: 5
        }
        const peopleValidabable: Validatable = {
            value: +people,
            required: true,
            min: 1
        }

        if (!validate(titleValidabable) ||
            !validate(descriptionValidabable) ||
            !validate(peopleValidabable)
        ) {
            alert('please provide valid input')
            return;
        }
        return [title, description, +people]
    }

    private clearUserInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
}


const projInput = new ProjectInput()

const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');