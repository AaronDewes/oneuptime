import { User } from '../../config';

// Description: Checks if the current user in the subProject.
// Params
// params 1: props
// returns JSX.Element or NULL
export default function IsUserInSubProject(subProject: $TSFixMe) {
    const userId = User.getUserId();
    return [null, undefined].every(i => i !== userId) &&
    [null, undefined].every(i => i !== subProject) &&
    [null, undefined].every(i => i !== subProject.users) &&
    subProject.users.length > 0 &&
    subProject.users.some((user: $TSFixMe) => user.userId === userId);
}
