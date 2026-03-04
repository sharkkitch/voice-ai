import { Variable, Endpoint, EndpointProviderModel } from '@rapidaai/react';
import { Tab } from '@/app/components/tab';
import { FC, ReactNode } from 'react';
import { CodeHighlighting } from '@/app/components/code-highlighting';
import { RapidaCredentialCard } from '@/app/components/base/cards/rapida-credential-card';

// Auto-sizes Monaco to its content.
// CodeHighlighting uses flex-1 which requires a flex parent, and Monaco
// needs an explicit pixel height — so we provide both.
const CodeBlock: FC<{ code: string; language: string }> = ({
  code,
  language,
}) => {
  const height = Math.max(100, code.split('\n').length * 22 + 40);
  return (
    <div style={{ height }} className="flex flex-col">
      <CodeHighlighting
        language={language}
        lineNumbers={false}
        foldGutter={false}
        code={code}
        className="flex-1"
      />
    </div>
  );
};

// ─── Step layout helper ───────────────────────────────────────────────────────

const Step: FC<{
  number: number;
  title: string;
  description?: string;
  children: ReactNode;
}> = ({ number, title, description, children }) => (
  <section className="px-4 py-5 space-y-3 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
    <div className="flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
        {number}
      </span>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    </div>
    {description && (
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    )}
    {children}
  </section>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const EndpointIntegration: FC<{ endpoint: Endpoint }> = ({
  endpoint,
}) => {
  const epm = endpoint.getEndpointprovidermodel();

  return (
    <Tab
      active="Python"
      className="bg-white dark:bg-gray-900 sticky top-0 z-10"
      tabs={[
        {
          label: 'Python',
          element: (
            <div className="pb-10 w-full">
              <Step
                number={1}
                title="Install the SDK"
                description="Install the Rapida Python SDK using pip."
              >
                <CodeBlock language="bash" code={`pip install rapida-python`} />
              </Step>

              <Step
                number={2}
                title="Authenticate"
                description={`Copy your publishable API key and replace RAPIDA_API_KEY in the code below.`}
              >
                <RapidaCredentialCard />
              </Step>

              <Step
                number={3}
                title="Import & initialise"
                description="Import the required classes and create a Rapida client."
              >
                <CodeBlock
                  language="python"
                  code={`from rapida import RapidaClient, RapidaClientOptions, RapidaEnvironment
from rapida.values import StringValue, AudioValue, FileValue, URLValue

client = RapidaClient(
    RapidaClientOptions(
        api_key="RAPIDA_API_KEY",
        environment=RapidaEnvironment.PRODUCTION,
    )
)`}
                />
              </Step>

              <Step
                number={4}
                title="Invoke your endpoint"
                description="Call the endpoint with the required input arguments."
              >
                <CodeBlock language="python" code={buildPythonInvoke(epm)} />
              </Step>
            </div>
          ),
        },
        {
          label: 'TypeScript',
          element: (
            <div className="pb-10 w-full">
              <Step
                number={1}
                title="Install the SDK"
                description="Install the Rapida Node.js SDK using npm or yarn."
              >
                <CodeBlock
                  language="bash"
                  code={`npm install @rapidaai/rapida-node\n# or\nyarn add @rapidaai/rapida-node`}
                />
              </Step>

              <Step
                number={2}
                title="Authenticate"
                description="Copy your publishable API key and replace RAPIDA_API_KEY in the code below."
              >
                <RapidaCredentialCard />
              </Step>

              <Step
                number={3}
                title="Import & initialise"
                description="Import the required classes and create a Rapida client."
              >
                <CodeBlock
                  language="typescript"
                  code={`import {
  RapidaClient,
  RapidaClientOptions,
  RapidaEnvironment,
} from '@rapidaai/rapida-node';
import { StringValue } from '@rapidaai/rapida-node/values';

const client = new RapidaClient(
  new RapidaClientOptions({
    apiKey: 'RAPIDA_API_KEY',
    environment: RapidaEnvironment.PRODUCTION,
  }),
);`}
                />
              </Step>

              <Step
                number={4}
                title="Invoke your endpoint"
                description="Call the endpoint with the required input arguments."
              >
                <CodeBlock
                  language="typescript"
                  code={buildTypeScriptInvoke(epm)}
                />
              </Step>
            </div>
          ),
        },
        {
          label: 'Golang',
          element: (
            <div className="pb-10 w-full">
              <Step
                number={1}
                title="Install the SDK"
                description="Add the Rapida Go module to your project."
              >
                <CodeBlock
                  language="bash"
                  code={`go get github.com/rapidaai/rapida-go`}
                />
              </Step>

              <Step
                number={2}
                title="Authenticate"
                description="Copy your publishable API key and replace RAPIDA_API_KEY in the code below."
              >
                <RapidaCredentialCard />
              </Step>

              <Step
                number={3}
                title="Import & initialise"
                description="Import the required packages and create a Rapida client."
              >
                <CodeBlock
                  language="go"
                  code={`import (
    "github.com/rapidaai/rapida-go/rapida"
    "github.com/rapidaai/rapida-go/rapida_builders"
)

client, err := rapida.GetClient(
    rapida_builders.ClientOptionBuilder().
        WithApiKey("RAPIDA_API_KEY").
        Build(),
)
if err != nil {
    log.Fatalf("failed to create client: %v", err)
}`}
                />
              </Step>

              <Step
                number={4}
                title="Invoke your endpoint"
                description="Build the endpoint definition and invoke it with your inputs."
              >
                <CodeBlock language="go" code={buildGolangInvoke(endpoint)} />
              </Step>
            </div>
          ),
        },
      ]}
    />
  );
};

// ─── Code builders ────────────────────────────────────────────────────────────

const buildPythonInvoke = (epm: EndpointProviderModel | undefined): string => {
  if (!epm) {
    return `response = await client.invoke(
    endpoint=("ENDPOINT_ID", "ENDPOINT_VERSION"),
    inputs={},
)
for item in response.get_data():
    print(item.to_text())`;
  }

  const vars = epm.getChatcompleteprompt()?.getPromptvariablesList() ?? [];
  const inputs = buildPythonInputs(vars);

  return `response = await client.invoke(
    endpoint=("${epm.getEndpointid()}", "vrsn_${epm.getId()}"),
    inputs={${inputs}},
)
for item in response.get_data():
    print(item.to_text())`;
};

const buildPythonInputs = (vars: Variable[]): string => {
  if (vars.length === 0) return '';
  return vars
    .map(v => {
      if (v.getType() === 'audio-files')
        return `\n        "${v.getName()}": AudioValue("/path/to/audio")`;
      if (v.getType() === 'files')
        return `\n        "${v.getName()}": FileValue("/path/to/file")`;
      if (v.getType() === 'url')
        return `\n        "${v.getName()}": URLValue("https://example.com")`;
      return `\n        "${v.getName()}": StringValue("example-value")`;
    })
    .join(',');
};

const buildTypeScriptInvoke = (
  epm: EndpointProviderModel | undefined,
): string => {
  if (!epm) {
    return `const response = await client.invoke({
  endpoint: ['ENDPOINT_ID', 'ENDPOINT_VERSION'],
  inputs: {},
});
for (const item of await response.getData()) {
  console.log(await item.toText());
}`;
  }

  const vars = epm.getChatcompleteprompt()?.getPromptvariablesList() ?? [];
  const inputs = buildTypeScriptInputs(vars);

  return `const response = await client.invoke({
  endpoint: ['${epm.getEndpointid()}', 'vrsn_${epm.getId()}'],
  inputs: {${inputs}},
});
for (const item of await response.getData()) {
  console.log(await item.toText());
}`;
};

const buildTypeScriptInputs = (vars: Variable[]): string => {
  if (vars.length === 0) return '';
  return vars
    .map(v => `\n    ${v.getName()}: new StringValue('example-value')`)
    .join(',');
};

const buildGolangInvoke = (endpoint: Endpoint): string => {
  const epm = endpoint.getEndpointprovidermodel();
  const endpointId = epm ? epm.getEndpointid() : 'ENDPOINT_ID';

  return `endpoint, err := rapida_builders.NewEndpointDefinitionBuilder().
    WithEndpointId("${endpointId}").
    Build()

request := rapida_builders.NewInvokeRequestBuilder(endpoint).
    AddStringInput("variable", "value").
    Build()

res, err := client.Invoke(request)
if err == nil && res.IsSuccess() {
    data, _ := res.GetData()
    for _, item := range data {
        text, _ := item.ToText()
        println(text)
    }
}`;
};
