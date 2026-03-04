export function FormActionHeading(props: {
  heading: string;
  action?: React.ReactElement;
}) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-[28px] leading-9 text-gray-900 dark:text-gray-100">
        {props.heading}
      </h2>
      {props.action}
    </div>
  );
}
