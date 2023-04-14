
import {usePistolValue} from "@scottburch/pistol";
import {AppsSubmissionForm} from "./AppsSubmissionForm";

export const AppsPage: React.FC = () => {
    const demos = usePistolValue('circles.portal.demo-list', '');
    return (
        <>
        DEMOS
            <AppsSubmissionForm/>

        </>

    )
};