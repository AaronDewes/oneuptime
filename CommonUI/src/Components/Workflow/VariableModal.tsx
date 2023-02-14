import ObjectID from 'Common/Types/ObjectID';
import WorkflowVariable from 'Model/Models/WorkflowVariable';
import React, { FunctionComponent, ReactElement } from 'react';
import ModelListModal from '../ModelListModal/ModelListModal';

export interface ComponentProps {
    workflowId: ObjectID;
    onClose: () => void;
    onSave: (variableId: string) => void;
}

const VariableModal: FunctionComponent<ComponentProps> = (
    props: ComponentProps
): ReactElement => {
    return (
        <ModelListModal
            modalTitle="Select a variable"
            query={{
                workflowId: props.workflowId,
            }}
            noItemsMessage="You do have any variables. Please add global or workflow variables."
            modalDescription="This list contains both Global and Workflow variables."
            titleField="name"
            descriptionField="description"
            modelType={WorkflowVariable}
            select={{
                _id: true,
                name: true,
                description: true,
                workflowId: true,
            }}
            onClose={props.onClose}
            onSave={(variables: Array<WorkflowVariable>) => {
                if (variables[0]?.workflowId) {
                    props.onSave(`{{local.variable.${variables[0]?.name}}}`);
                } else {
                    props.onSave(`{{global.variable.${variables[0]?.name}}}`);
                }
            }}
        />
    );
};

export default VariableModal;
