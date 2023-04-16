import React, {
    FunctionComponent,
    ReactElement,
    useEffect,
    useState,
} from 'react';
import FieldLabelElement from 'CommonUI/src/Components/Forms/Fields/FieldLabel';
import Button from 'CommonUI/src/Components/Button/Button';
import MonitorStep from 'Common/Types/Monitor/MonitorStep';
import Input from 'CommonUI/src/Components/Input/Input';
import MonitorCriteriaElement from './MonitorCriteria';
import MonitorCriteria from 'Common/Types/Monitor/MonitorCriteria';
import Dropdown, { DropdownOption, DropdownValue } from 'CommonUI/src/Components/Dropdown/Dropdown';
import URL from 'Common/Types/API/URL';
import MonitorType from 'Common/Types/Monitor/MonitorType';
import DropdownUtil from 'CommonUI/src/Utils/Dropdown';
import HTTPMethod from 'Common/Types/API/HTTPMethod';
import IP from 'Common/Types/IP/IP';
import BadDataException from 'Common/Types/Exception/BadDataException';
import DictionaryOfStrings from 'CommonUI/src/Components/Dictionary/String';
import Dictionary from 'Common/Types/Dictionary';
import CodeEditor from 'CommonUI/src/Components/CodeEditor/CodeEditor';
import CodeType from 'Common/Types/Code/CodeType';


export interface ComponentProps {
    monitorStatusDropdownOptions: Array<DropdownOption>;
    initialValue?: undefined | MonitorStep;
    onChange?: undefined | ((value: MonitorStep) => void);
    onDelete?: undefined | (() => void);
    monitorType: MonitorType;
}

const MonitorStepElement: FunctionComponent<ComponentProps> = (
    props: ComponentProps
): ReactElement => {
    const [monitorStep, setMonitorStep] = useState<MonitorStep>(
        props.initialValue || new MonitorStep()
    );

    useEffect(() => {
        if (props.onChange && monitorStep) {
            props.onChange(monitorStep);
        }
    }, [monitorStep]);


    const [destinationFieldTitle, setDestinationFieldTitle] = useState<string>('URL');
    const [destinationFieldDescription, setDestinationFieldDescription] = useState<string>('');
    const requestTypeDropdownOptions: Array<DropdownOption> = DropdownUtil.getDropdownOptionsFromEnum(HTTPMethod);

    useEffect(() => {
        if (props.monitorType === MonitorType.API) {
            setDestinationFieldTitle('API URL');
            setDestinationFieldDescription('Whats the URL of the API you want to monitor?');
        } else if (props.monitorType === MonitorType.Website) {
            setDestinationFieldTitle('Website URL');
            setDestinationFieldDescription('Whats the URL of the website you want to monitor?');
        } else if (props.monitorType === MonitorType.Ping) {
            setDestinationFieldTitle('Ping URL');
            setDestinationFieldDescription('Whats the URL of the resource you want to ping?');
        } else if (props.monitorType === MonitorType.IP) {
            setDestinationFieldTitle('IP Address');
            setDestinationFieldDescription('Whats the IP address you want to monitor?');
        }
    }, [props.monitorType])

    return (
        <div>
            <div>
                <FieldLabelElement title={destinationFieldTitle} description={destinationFieldDescription} required={true} />
                <Input
                    initialValue={
                        monitorStep?.data?.monitorDestination?.toString() || ''
                    }

                    onChange={(value: string) => {

                        let destination: IP | URL | undefined = undefined;

                        if (props.monitorType === MonitorType.IP) {
                            destination = IP.fromString(value);
                        } else if (props.monitorType === MonitorType.Ping) {
                            if (IP.isIP(value)) {
                                destination = IP.fromString(value);
                            } else {
                                destination = URL.fromString(value);
                            }
                        } else if (props.monitorType === MonitorType.Website) {
                            destination = URL.fromString(value);
                        } else if (props.monitorType === MonitorType.API) {
                            destination = URL.fromString(value);
                        }

                        if (!destination) {
                            throw new BadDataException('Invalid destination');
                        }

                        monitorStep.setMonitorDestination(destination);
                        setMonitorStep(MonitorStep.clone(monitorStep));
                    }}
                />
            </div>
            {props.monitorType === MonitorType.API && <div>
                <FieldLabelElement title={"API Request Type"} description={"Whats the type of the API request?"} required={true} />
                <Dropdown
                    initialValue={requestTypeDropdownOptions.find(
                        (i: DropdownOption) => {
                            return i.value === (monitorStep?.data?.requestType || HTTPMethod.GET);
                        }
                    )}
                    options={requestTypeDropdownOptions}
                    onChange={(
                        value: DropdownValue | Array<DropdownValue> | null
                    ) => {

                        monitorStep.setRequestType(value?.toString() as HTTPMethod || HTTPMethod.GET);
                        setMonitorStep(MonitorStep.clone(monitorStep));
                    }}
                />
            </div>}

            {props.monitorType === MonitorType.API && <div>
                <FieldLabelElement title={"API Request Type"} description={"Whats the type of the API request?"} required={true} />
                <Dropdown
                    initialValue={requestTypeDropdownOptions.find(
                        (i: DropdownOption) => {
                            return i.value === (monitorStep?.data?.requestType || HTTPMethod.GET);
                        }
                    )}
                    options={requestTypeDropdownOptions}
                    onChange={(
                        value: DropdownValue | Array<DropdownValue> | null
                    ) => {

                        monitorStep.setRequestType(value?.toString() as HTTPMethod || HTTPMethod.GET);
                        setMonitorStep(MonitorStep.clone(monitorStep));
                    }}
                />
            </div>}


            {props.monitorType === MonitorType.API && <div>
                <FieldLabelElement title={"Request Headers"} description={"Request Headers to send, if any."} required={false} />
                <DictionaryOfStrings  initialValue={monitorStep.data?.requestHeaders || {}} onChange={(value: Dictionary<string>)=>{
                    monitorStep.setRequestHeaders(value);
                    setMonitorStep(MonitorStep.clone(monitorStep));
                }} />
            </div>}


            {props.monitorType === MonitorType.API && <div>
                <FieldLabelElement title={"Request Body (in JSON)"} description={"Request Body to send in JSON, if any."} required={false} />
                <CodeEditor type={CodeType.JSON} initialValue={monitorStep.data?.requestBody} onChange={(value: string)=>{
                    monitorStep.setRequestBody(value);
                    setMonitorStep(MonitorStep.clone(monitorStep));
                }}/>
            </div>}

            <div>
                <FieldLabelElement title="Monitor Criteria" required={true} />
                <MonitorCriteriaElement
                    monitorStatusDropdownOptions={
                        props.monitorStatusDropdownOptions
                    }
                    initialValue={monitorStep?.data?.monitorCriteria}
                    onChange={(value: MonitorCriteria) => {

                        monitorStep.setMonitorCriteria(value);
                        setMonitorStep(MonitorStep.clone(monitorStep));

                    }}
                />
            </div>

            <div>
                <Button
                    onClick={() => {
                        if (props.onDelete) {
                            props.onDelete();
                        }
                    }}
                    title="Delete"
                />
            </div>
        </div>
    );
};

export default MonitorStepElement;
