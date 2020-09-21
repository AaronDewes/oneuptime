import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { Field } from 'redux-form';
import { ValidateField } from '../../config';
import RenderOptions from '../basic/RenderOptions';
import { RenderSelect } from '../basic/RenderSelect';

export class ResponseParent extends Component {
    // eslint-disable-next-line
    constructor(props) {
        super(props);
    }
    render() {
        const { fields, bodyfield, level, type } = this.props;
        if ((!fields || !fields.length) && level > 1) {
            fields.push({
                match: '',
                responseType: '',
                filter: '',
                field1: '',
                field2: '',
                field3: false,
            });
        }
        return (
            <ul id={fields.name}>
                {bodyfield && bodyfield.length
                    ? fields.map((newval, j) => {
                          return (
                              <React.Fragment key={j}>
                                  {j === 0 ? (
                                      <li>
                                          <div
                                              className="bs-Fieldset-row"
                                              style={{
                                                  padding: '10px 4px 5px 4px',
                                                  display: 'inline-block',
                                                  marginLeft: `${
                                                      level > 1
                                                          ? level * 10 + 10
                                                          : 10
                                                  }px`,
                                              }}
                                          >
                                              <label
                                                  className="bs-Fieldset-label"
                                                  style={{ padding: '6px' }}
                                              >
                                                  Match
                                              </label>
                                              <div className="bs-Fieldset-fields">
                                                  <Field
                                                      className="db-select-nw db-select-nw-100"
                                                      component={RenderSelect}
                                                      name={`${newval}.match`}
                                                      id="match"
                                                      placeholder="match"
                                                      disabled={false}
                                                      validate={
                                                          ValidateField.select
                                                      }
                                                      message="of the following rules :"
                                                      options={[
                                                          {
                                                              value: '',
                                                              label: 'None',
                                                          },
                                                          {
                                                              value: 'all',
                                                              label: 'All',
                                                          },
                                                          {
                                                              value: 'any',
                                                              label: 'Any',
                                                          },
                                                      ]}
                                                  />
                                              </div>
                                          </div>
                                      </li>
                                  ) : (
                                      ''
                                  )}

                                  <RenderOptions
                                      bodyfield={bodyfield[j]}
                                      level={level}
                                      addField={() =>
                                          fields.insert(j + 1, {
                                              responseType: '',
                                              filter: '',
                                              field1: '',
                                              field2: '',
                                              field3: false,
                                          })
                                      }
                                      removeField={removeArrayField =>
                                          level > 1 &&
                                          fields &&
                                          fields.length < 2
                                              ? removeArrayField(
                                                    fields.name.substring(
                                                        0,
                                                        fields.name.length - 11
                                                    )
                                                )
                                              : fields.remove(j)
                                      }
                                      fieldnameprop={newval}
                                      type={type}
                                  />
                                  {level < 3 &&
                                  bodyfield[j] &&
                                  bodyfield[j].field3 ? (
                                      <FieldArray
                                          name={`${newval}.collection`}
                                          component={ResponseParent}
                                          type={this.props.type}
                                          bodyfield={bodyfield[j].collection}
                                          level={level + 1}
                                      />
                                  ) : (
                                      ''
                                  )}
                              </React.Fragment>
                          );
                      })
                    : ''}
            </ul>
        );
    }
}

ResponseParent.displayName = 'ResponseParent';

ResponseParent.propTypes = {
    fields: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    bodyfield: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    level: PropTypes.number,
    type: PropTypes.string,
};

const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect({}, mapDispatchToProps)(ResponseParent);
