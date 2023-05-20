import {throwError} from "rxjs";

const error = <Code extends string, T extends Object>(code: Code, data?: T) => throwError(() => ({code, ...(data || {})}));
export const userAlreadyExistsError = (username: string) => error('USERNAME_ALREADY_EXISTS', {username});
export const notLoggedInError = () => error('NOT_LOGGED_IN');
export const unauthorizedUserError = (username: string) => error('UNAUTHORIZED_USER', {username});


