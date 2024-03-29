class Model {
    static get properties() {
        return [
            {
                name: "id",
                valid: (id) => typeof id === "number" && id >= 0,
            },
            {
                name: "created",
                valid: (created) => created instanceof Date,
            },
            {
                name: "updated",
                valid: (updated) => updated instanceof Date,
                private: true,
            },
        ];
    }

    static get db() {
        return require("../db").db;
    }

    constructor(given) {
        // assign given properties if valid
        const valid = this.validate(given);
        this.db = require("../db").db;
        if (valid === true) {
            Object.assign(this, given);
        } else {
            throw new Error(JSON.stringify(valid));
        }
    }

    // validate properties
    validate(properties) {
        const propertyList = [];

        // validate each property
        for (const property in properties) {
            if (properties[property] === null) {
                continue;
            }
            propertyList.push(property);
            if (
                this.constructor.properties
                    .map((p) => p.name)
                    .indexOf(property) !== -1
            ) {
                if (
                    !this.constructor.properties
                        .filter((p) => p.name === property)[0]
                        .valid(properties[property])
                ) {
                    return {
                        type: "ValidationError",
                        reason: "InvalidValue",
                        property: property,
                    };
                }
            } else {
                return {
                    type: "ValidationError",
                    reason: "InvalidProperty",
                    property: property,
                };
            }
        }

        const requiredProperties = this.constructor.properties.filter(
            (property) => property.required
        );

        // check for required properties
        for (let p = 0; p < requiredProperties.length; p++) {
            if (propertyList.indexOf(requiredProperties[p].name) === -1) {
                return {
                    type: "ValidationError",
                    reason: "MissingProperty",
                    property: requiredProperties[p].name,
                };
            }
        }

        return true;
    }

    // save properties to database
    async save() {
        const requiredProperties = this.constructor.properties.filter(
            (property) => property.required
        );
        const optionalProperties = this.constructor.properties.filter(
            (property) => !property.required
        );

        // change updated if being updated
        if (this.updated !== undefined) {
            this.updated = new Date();
        }

        // create object with required properties
        let object = {};
        for (let i = 0; i < requiredProperties.length; i++) {
            object[requiredProperties[i].name] = this[
                requiredProperties[i].name
            ];
        }

        // add optional properties if they exist
        for (let i = 0; i < optionalProperties.length; i++) {
            if (this[optionalProperties[i].name] !== undefined) {
                object[optionalProperties[i].name] = this[
                    optionalProperties[i].name
                ];
            }
        }

        // validate
        const valid = this.validate(object);
        if (valid === true) {
            if (this.id === undefined || this.id === null) {
                // create new object if no id yet
                object = (
                    await this.db(this.constructor.tableName).insert(
                        object,
                        "*"
                    )
                )[0];
                Object.assign(this, object);
            } else if (typeof this.id === "number") {
                // update existing object if there is an id
                await this.db(this.constructor.tableName)
                    .where("id", this.id)
                    .update(object);
            } else {
                const error = {
                    type: "ValidationError",
                    reason: "InvalidValue",
                    property: "id",
                };
                throw error;
            }
        } else {
            throw valid;
        }
    }

    // return one object matching properties
    static async findOne(properties) {
        const users = await this.db(this.tableName).where(properties).limit(1);
        if (users.length > 0) {
            return new this(users[0]);
        } else {
            return false;
        }
    }

    // return one object serialiezd
    static async findOneSerialized(properties, privatePropertiesToInclude) {
        if (privatePropertiesToInclude === undefined) {
            privatePropertiesToInclude = [];
        }
        const object = await this.findOne(properties);
        if (!object) {
            return false;
        }
        const serialized = {};
        for (let p = 0; p < this.properties.length; p++) {
            if (
                !this.properties[p].private ||
                privatePropertiesToInclude.indexOf(this.properties[p].name) !==
                    -1
            ) {
                // if the property is not private, consider adding it
                if (this.properties[p].required) {
                    // if the property is required, add it
                    serialized[this.properties[p].name] =
                        object[this.properties[p].name];
                } else if (
                    object[this.properties[p].name] !== undefined &&
                    object[this.properties[p].name] !== null
                ) {
                    // if the property is not required but exists, add it
                    serialized[this.properties[p].name] =
                        object[this.properties[p].name];
                }
            }
        }
        return serialized;
    }

    // return all objects matching properties
    static async find(properties) {
        return (await this.db(this.tableName).where(properties)).map(
            (object) => new this(object)
        );
    }

    // return objects serialized
    static async findSerialized(properties) {
        // find objects
        const objects = await this.find(properties);
        const serialized = [];
        for (let o = 0; o < objects.length; o++) {
            // create new serialized object
            const object = {};
            for (let p = 0; p < this.properties.length; p++) {
                if (!this.properties[p].private) {
                    // if the property is not private, consider adding it
                    if (this.properties[p].required) {
                        // if the property is required, add it
                        object[this.properties[p].name] =
                            objects[o][this.properties[p].name];
                    } else if (
                        objects[o][this.properties[p].name] !== undefined &&
                        objects[o][this.properties[p].name] !== null
                    ) {
                        // if the property is not required but exists, add it
                        object[this.properties[p].name] =
                            objects[o][this.properties[p].name];
                    }
                }
            }
            serialized.push(object);
        }
        return serialized;
    }

    // delete all objects matching properties
    static async delete(properties) {
        await this.db(this.tableName).where(properties).del();
    }
}

module.exports = Model;
