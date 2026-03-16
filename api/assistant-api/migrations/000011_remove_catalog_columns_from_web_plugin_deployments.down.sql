ALTER TABLE public.assistant_web_plugin_deployments ADD COLUMN IF NOT EXISTS help_center_enabled BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.assistant_web_plugin_deployments ADD COLUMN IF NOT EXISTS product_catalog_enabled BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.assistant_web_plugin_deployments ADD COLUMN IF NOT EXISTS article_catalog_enabled BOOLEAN DEFAULT false NOT NULL;
