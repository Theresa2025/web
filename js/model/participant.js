export default class Participant {
    #id;
    #name;
    #email;
    #avatar;

    constructor({ id, name, email, avatar }) {
        this.#id = id;
        this.#name = name;
        this.#email = email;
        this.#avatar = avatar;
    }

    get id() { return this.#id; }
    get name() { return this.#name; }
    get email() { return this.#email; }
    get avatar() { return this.#avatar; }
}
