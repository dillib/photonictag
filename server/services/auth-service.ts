import { storage } from "../storage";
import type { User, UpsertUser, Role, InsertRole } from "@shared/schema";

export class AuthService {
  async getUser(id: string): Promise<User | undefined> {
    return storage.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return storage.getUserByEmail(email);
  }

  async createUser(data: UpsertUser): Promise<User> {
    return storage.createUser(data);
  }

  async getRole(id: string): Promise<Role | undefined> {
    return storage.getRole(id);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    return storage.getRoleByName(name);
  }

  async createRole(data: InsertRole): Promise<Role> {
    return storage.createRole(data);
  }

  hasPermission(role: Role | undefined, permission: string): boolean {
    if (!role || !role.permissions) return false;
    return role.permissions.includes(permission) || role.permissions.includes("*");
  }
}

export const authService = new AuthService();
