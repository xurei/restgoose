"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modelsRegistryMap = new Map();
const submodelsRegistryMap = new Map();
const RestRegistry = {
    registerModel(modelType, config) {
        modelsRegistryMap.set(modelType.name, {
            type: modelType,
            config,
        });
    },
    registerSubModel(modelType, propertyKey, config) {
        if (!submodelsRegistryMap.has(modelType.name)) {
            submodelsRegistryMap.set(modelType.name, new Map());
        }
        submodelsRegistryMap.get(modelType.name).set(propertyKey, {
            type: modelType,
            property: propertyKey,
            config,
        });
    },
    getModel(modelType) {
        return modelsRegistryMap.get(modelType.name);
    },
    listModels() {
        return modelsRegistryMap.values();
    },
    listSubModelsOf(modelType) {
        const map = submodelsRegistryMap.get(modelType.name);
        if (map) {
            return submodelsRegistryMap.get(modelType.name).values();
        }
        else {
            return [];
        }
    },
};
exports.RestRegistry = RestRegistry;
//# sourceMappingURL=RestRegistry.js.map