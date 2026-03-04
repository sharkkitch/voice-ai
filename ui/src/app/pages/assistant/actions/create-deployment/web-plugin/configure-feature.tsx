import { InputCheckbox } from '@/app/components/form/checkbox';
import { Label } from '@/app/components/form/label';

export interface FeatureConfig {
  qAListing: boolean;
  productCatalog: boolean;
  blogPost: boolean;
}

interface ConfigureFeatureProps {
  onConfigChange: (config: FeatureConfig) => void;
  config: FeatureConfig;
}

export const ConfigureFeature: React.FC<ConfigureFeatureProps> = ({
  onConfigChange,
  config,
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const featureMap: Record<string, keyof typeof config> = {
      q_a_listing: 'qAListing',
      product_catalog: 'productCatalog',
      blog_post: 'blogPost',
    };

    const stateKey = featureMap[name];
    if (stateKey) {
      onConfigChange({ ...config, [stateKey]: checked });
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Left: section label */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Agent Features
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Enable sections and features available in the web widget.
          </p>
        </div>

        {/* Right: fields */}
        <div className="space-y-6 max-w-xl">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sections
            </Label>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Each section offers different features and content in the web widget.
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <InputCheckbox
                  name="q_a_listing"
                  id="q_a_listing"
                  checked={config.qAListing}
                  onChange={handleCheckboxChange}
                />
                <Label className="text-sm cursor-pointer" for="q_a_listing">
                  Help center / Q&A Listing
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <InputCheckbox
                  name="product_catalog"
                  id="product_catalog"
                  checked={config.productCatalog}
                  onChange={handleCheckboxChange}
                />
                <Label className="text-sm cursor-pointer" for="product_catalog">
                  Product Catalog
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <InputCheckbox
                  name="blog_post"
                  id="blog_post"
                  checked={config.blogPost}
                  onChange={handleCheckboxChange}
                />
                <Label className="text-sm cursor-pointer" for="blog_post">
                  Blog Post / Articles
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
