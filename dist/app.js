"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function validate(validatableInput) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (typeof validatableInput.value === 'string' && validatableInput.minLength != null && validatableInput.minLength) {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (typeof validatableInput.value === 'string' && validatableInput.maxLength != null && validatableInput.maxLength) {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (typeof validatableInput.value === 'number' && validatableInput.min != null) {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (typeof validatableInput.value === 'number' && validatableInput.max != null) {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}
function Autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjustDescriptor = {
        configurable: true,
        get() {
            const boundFucntion = originalMethod.bind(this);
            return boundFucntion;
        }
    };
    return adjustDescriptor;
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById("project-list");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        this.attach();
        this.renderContent();
    }
    attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = this.type.toUpperCase() + ' PROJECTS';
    }
}
class ProjectInput {
    constructor() {
        this.templateElement = (document.getElementById('project-input'));
        this.hostElement = (document.getElementById('app'));
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.configure();
        this.attach();
        this.titleInputElement = (document.getElementById('title'));
        this.descriptionInputElement = (document.getElementById('description'));
        this.peopleInputElement = (document.getElementById('people'));
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
    configure() {
        console.log(this);
        this.element.addEventListener('submit', this.submitHandler);
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.getUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
            this.clearUserInput();
        }
    }
    getUserInput() {
        const title = this.titleInputElement.value.trim();
        const description = this.descriptionInputElement.value.trim();
        const people = this.peopleInputElement.value.trim();
        const titleValidabable = {
            value: title,
            required: true
        };
        const descriptionValidabable = {
            value: description,
            required: true,
            minLength: 5
        };
        const peopleValidabable = {
            value: +people,
            required: true,
            min: 1
        };
        if (!validate(titleValidabable) ||
            !validate(descriptionValidabable) ||
            !validate(peopleValidabable)) {
            alert('please provide valid input');
            return;
        }
        return [title, description, +people];
    }
    clearUserInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
const projInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
//# sourceMappingURL=app.js.map