// from https://mackerel.io/ja/docs/entry/howto/container-agent

interface MackerelContainerAgentConfig {
  apikey?: string
  apibase?: string
  roles?: ReadonlyArray<string>
  ignoreContainer?: string
  root?: string
  plugins?: PluginConfig
  readinessProbe?: ReadinessProbe
}

interface PluginConfig {
  metrics: MetricPluginConfigEntries
  checks: CheckPluginConfigEntries
}

type MetricPluginConfigEntries = Record<string, MetricPluginConfig>

interface MetricPluginConfig {
  command: string
  user?: string
  env?: Record<string, string>
  timeoutSeconds?: number
}

type CheckPluginConfigEntries = Record<string, CheckPluginConfig>

interface CheckPluginConfig {
  command: string
  user?: string
  env?: Record<string, string>
  timeoutSeconds?: number
  memo?: string
}

type ReadinessProbe = ExecProbe | HttpProbe | TcpProbe

interface CommonProbeOptions {
  timeoutSeconds?: number
  initialDelaySeconds?: number
  periodSeconds?: number
}

interface ExecProbe extends CommonProbeOptions {
  command: string
  user?: string
  env?: Record<string, string>
}

interface HttpProbe extends CommonProbeOptions {
  path: string
  scheme?: string
  method?: string
  host?: string
  port?: string
  headers?: ReadonlyArray<HttpHeader>
}

type HttpHeader = Record<"name" | "value", string>

interface TcpProbe extends CommonProbeOptions {
  port: number
  host?: string
}
