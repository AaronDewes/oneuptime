import React from 'react';
import PropTypes from 'prop-types';
import { RenderMonitor } from './RenderMonitor';
import { Draggable } from 'react-beautiful-dnd';

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => {
    return {
        userSelect: 'none',
        padding: grid * 2,
        display: 'flex',
        alignItems: 'center',
        margin: `0 0 ${grid}px 0`,
        borderRadius: '5px',
        boxShadow: isDragging
            ? 'rgb(50 50 93 / 10%) 0px 7px 14px 0px, rgb(0 0 0 / 7%) 0px 3px 6px 0px'
            : 'unset',
        background: '#f7f7f7',
        ...draggableStyle,
        ...(isDragging && { pointerEvents: 'auto' }),
    };
};

const RenderMonitors = ({ fields, subProject, form, statusPageCategory }) => (
    <ul>
        {fields.map((monitor, index) => {
            return (
                <Draggable key={monitor} draggableId={monitor} index={index}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                            )}
                            className="Layout-box movable-layout-box"
                        >
                            <RenderMonitor
                                key={index}
                                monitorIndex={index}
                                monitor={monitor}
                                fields={fields}
                                subProject={subProject}
                                form={form}
                                statusPageCategory={statusPageCategory}
                            />
                        </div>
                    )}
                </Draggable>
            );
        })}
    </ul>
);

RenderMonitors.displayName = 'RenderMonitors';
RenderMonitors.propTypes = {
    fields: PropTypes.object.isRequired,
    subProject: PropTypes.object.isRequired,
    form: PropTypes.string,
    statusPageCategory: PropTypes.string,
};

export { RenderMonitors };
