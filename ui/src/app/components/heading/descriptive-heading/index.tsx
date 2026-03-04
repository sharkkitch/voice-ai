export function DescriptiveHeading(props: {
  heading: string;
  info?: string;
  subheading?: string;
}) {
  return (
    <div className="flex flex-col py-2">
      <h1 className="text-[28px] leading-9 text-gray-900 dark:text-gray-100">
        {props.heading}
        {props.info && <small className="text-base ml-2">({props.info})</small>}
      </h1>
      <h3 className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-5">{props.subheading}</h3>
    </div>
  );
}
