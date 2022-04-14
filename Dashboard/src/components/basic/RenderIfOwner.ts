import { connect } from 'react-redux';
import { User } from '../../config';
import { RootState } from '../../store';
// Description: Will render the component is the current user in the project is admin.
// Params
// params 1: props
// returns JSX.Element or NULL
export const RenderIfOwner: Function = (props: $TSFixMe): void => {
    const { currentProject, children } = props;
    const userId = User.getUserId();
    let renderItems = null;
    if (
        userId &&
        currentProject &&
        currentProject.users &&
        currentProject.users.length > 0 &&
        currentProject.users.filter(
            (user: $TSFixMe) => user.userId === userId && user.role === 'Owner'
        ).length > 0
    ) {
        renderItems = children;
    }

    return renderItems;
};

function mapStateToProps(state: RootState): void {
    return {
        currentProject: state.project.currentProject,
    };
}

export default connect(mapStateToProps)(RenderIfOwner);
