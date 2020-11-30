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

// ProjectList Class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;

    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;

        // create a document node / DocumentFragment with content of HTML template 
        const importedNode = document.importNode(this.templateElement.content, true);

        // assign this DocumentFragment to the element
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        // attach created Element using template to the dom using hostElement
        this.attach();
        this.renderContent();
    }

    private attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element)
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }
}

// Project Input Class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        // get the template element using ID
        this.templateElement = (document.getElementById('project-input')!) as HTMLTemplateElement;

        // get the host element where template element will be added later
        this.hostElement = (document.getElementById('app')!) as HTMLDivElement;

        // creating a DocumentFragmenent node to later insert as a valid HTML element
        const importedNode = document.importNode(this.templateElement.content, true)
        // Cannot insert a DocumentFragment directly, so typecast it as a HTMLFOrmElement
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input'

        this.configure()
        this.attach()
        this.titleInputElement = (document.getElementById('title')) as HTMLInputElement;
        this.descriptionInputElement = (document.getElementById('description')!) as HTMLInputElement;
        this.peopleInputElement = (document.getElementById('people')!) as HTMLInputElement;
    }

    private attach() {
        // Inserting the HTMLFormElement formed from HTMLTemplate after the host element
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }


    private configure() {
        // add event listeners
        console.log(this)
        this.element.addEventListener('submit', this.submitHandler)
    }

    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput()
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput
            console.log(title, description, people)
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