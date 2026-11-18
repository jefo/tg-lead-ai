// src/infrastructure/persistence/json-business-logic.repository.ts

import { BusinessLogicRepository, BusinessRules } from "../../domain/ports/business-logic.repository";
import * as fs from 'fs/promises';
import * as path from 'path';

let db: Record<string, BusinessRules> | null = null;

async function readDb(): Promise<Record<string, BusinessRules>> {
    if (db) {
        return db;
    }
    // Bun.resolveSync is used to get the absolute path to the file
    const filePath = path.resolve(import.meta.dir, '../../../business-logic.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    db = JSON.parse(fileContent);
    return db as Record<string, BusinessRules>;
}

export const jsonBusinessLogicRepository: BusinessLogicRepository = {
    getRulesForIndustry: async (industry: string): Promise<BusinessRules | null> => {
        const database = await readDb();
        return database[industry] || null;
    }
}
