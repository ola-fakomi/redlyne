import { z } from 'zod';

export const SourceConfidence = z.enum(['exact', 'high', 'low']);
export const SourceMethod = z.enum(['build_plugin', 'framework_metadata', 'css_source_map', 'heuristic']);
export const ChangeKind = z.enum(['style', 'text', 'attribute']);
export const ChangeScope = z.enum(['auto', 'instance', 'component', 'token']);
export const BreakpointApplies = z.enum(['all', 'current']);

export const SourceSchema = z.object({
  confidence: SourceConfidence,
  method: SourceMethod,
  file: z.string().nullable(),
  line: z.number().nullable(),
  column: z.number().nullable(),
  component_stack: z.array(z.string()),
});

export const LocatorSchema = z.object({
  css_path: z.string(),
  test_id: z.string().nullable(),
  class_list: z.array(z.string()),
  text_preview: z.string().nullable(),
});

export const StylingSchema = z.object({
  tailwind_classes: z.array(z.string()),
  matched_rules: z.array(z.string()),
});

export const ChangeRecordSchema = z.object({
  change_id: z.string(),
  kind: ChangeKind,
  property: z.string(),
  group: z.string(),
  before: z.object({
    authored: z.string().nullable(),
    computed: z.string(),
    token: z.string().nullable(),
  }),
  after: z.object({
    value: z.string(),
    computed: z.string(),
    token: z.string().nullable(),
  }),
  breakpoint: z.object({
    applies: BreakpointApplies,
    active_media: z.array(z.string()),
  }),
  dynamic_content: z.boolean(),
  copied: z.boolean(),
  description: z.string(),
});

export const ElementRecordSchema = z.object({
  element_id: z.string(),
  label: z.string(),
  tag: z.string(),
  scope: ChangeScope,
  instance_count: z.number(),
  note: z.string().nullable(),
  source: SourceSchema,
  locator: LocatorSchema,
  styling: StylingSchema,
  changes: z.array(ChangeRecordSchema),
});

export const ChangeSetSchema = z.object({
  schema_version: z.literal(1),
  id: z.string(),
  created_at: z.string(),
  note: z.string().nullable(),
  page: z.object({
    url: z.string(),
    viewport: z.object({ width: z.number(), height: z.number(), dpr: z.number() }),
    color_scheme: z.string(),
  }),
  environment: z.object({
    framework: z.string(),
    styling: z.array(z.string()),
    source_plugin: z.boolean(),
  }),
  elements: z.array(ElementRecordSchema),
});

export type Source = z.infer<typeof SourceSchema>;
export type Locator = z.infer<typeof LocatorSchema>;
export type ChangeRecord = z.infer<typeof ChangeRecordSchema>;
export type ElementRecord = z.infer<typeof ElementRecordSchema>;
export type ChangeSet = z.infer<typeof ChangeSetSchema>;
