import { connect } from 'react-redux';
import { User } from '../../config';

// Description: Will render the component is the current user in the project is admin.
// Params
// params 1: props
// returns JSX.Element or NULL
export function RenderIfSubProjectAdmin(props: $TSFixMe) {
    const { children, currentProject, subProjects, subProjectId } = props;
    const userId = User.getUserId();
    let renderItems = null;
    if (
        userId &&
        currentProject &&
        currentProject.users &&
        currentProject.users.length > 0 &&
        currentProject.users.filter(
            (user: $TSFixMe) => user.userId === userId &&
            (user.role === 'Administrator' || user.role === 'Owner')
        ).length > 0
    ) {
        renderItems = children;
    } else {
        if (subProjects) {
            subProjects.forEach((subProject: $TSFixMe) => {
                if (subProjectId) {
                    if (
                        subProject._id === subProjectId &&
                        subProject.users.filter(
                            (user: $TSFixMe) => user.userId === userId &&
                            (user.role === 'Administrator' ||
                                user.role === 'Owner')
                        ).length > 0
                    ) {
                        renderItems = children;
                    }
                } else {
                    if (
                        userId &&
                        subProject &&
                        subProject.users &&
                        subProject.users.length > 0 &&
                        subProject.users.filter(
                            (user: $TSFixMe) => user.userId === userId &&
                            (user.role === 'Administrator' ||
                                user.role === 'Owner')
                        ).length > 0
                    ) {
                        renderItems = children;
                    }
                }
            });
        }
    }
    return renderItems;
}

function mapStateToProps(state: $TSFixMe) {
    return {
        subProjects: state.subProject.subProjects.subProjects,
        currentProject: state.project.currentProject,
    };
}

export default connect(mapStateToProps)(RenderIfSubProjectAdmin);
