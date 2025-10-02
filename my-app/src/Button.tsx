
type ButtonProps = {
    name: string;
    onClick?: () => void;
    className?: string;
};

export default function Button(props: ButtonProps) {
    return (
        <button className={props.className} onClick={props.onClick}>{props.name}</button>
    );
}