import { LogTemplate } from '.'

export const TEMPLATES: LogTemplate[] = [
  {
    label: 'Recent Errors',
    mode: 'simple',
    searchString: '[Ee]rror|\\s[45][0-9][0-9]\\s',
    for: ['api'],
  },
  {
    label: 'Commits',
    mode: 'simple',
    searchString: 'COMMIT',
    for: ['database'],
  },
  {
    label: 'Commits By User',
    mode: 'custom',
    searchString: `SELECT
    p.user_name, count(*) as count
FROM postgres_logs
  LEFT JOIN UNNEST(metadata) as m ON TRUE
  LEFT JOIN UNNEST(m.parsed) AS p ON TRUE
WHERE
  REGEXP_CONTAINS(event_message, 'COMMIT')
GROUP BY
  p.user_name
    `,
    for: ['database'],
  },
  {
    label: 'Metadata IP',
    mode: 'custom',
    searchString: `SELECT timestamp, h.x_real_ip
FROM edge_logs
  LEFT JOIN UNNEST(metadata) as m ON TRUE
  LEFT JOIN UNNEST(m.request) AS r ON TRUE
  LEFT JOIN UNNEST(r.headers) AS h ON TRUE
WHERE h.x_real_ip IS NOT NULL
`,
    for: ['api'],
  },
  {
    label: 'Requests by Country',
    mode: 'custom',
    searchString: `SELECT 
  cf.country, count(*) as count
FROM edge_logs
  LEFT JOIN UNNEST(metadata) as m ON TRUE
  LEFT JOIN UNNEST(m.request) AS r ON TRUE
  LEFT JOIN UNNEST(r.cf) AS cf ON TRUE
GROUP BY
  cf.country
ORDER BY
  count DESC
`,
    for: ['api'],
  },
]

export const LOG_TYPE_LABEL_MAPPING: { [k: string]: string } = {
  explorer: 'Explorer',
  api: 'API',
  database: 'Database',
}

export const genDefaultQuery = (table: LogsTableName, where: string | undefined) => {
  switch (table) {
    case 'edge_logs':
      return `SELECT id, timestamp, event_message, metadata, request, response, request.method, request.path, response.status_code
FROM ${table}
cross join unnest(metadata) as m
cross join unnest(m.request) as request
cross join unnest(m.response) as response
${where}
LIMIT 100
`
      break

    case 'postgres_logs':
      return `SELECT postgres_logs.timestamp, id, event_message, metadata, metadataParsed.error_severity FROM ${table} 
cross join unnest(metadata) as m 
cross join unnest(m.parsed) as metadataParsed 
${where} 
LIMIT 100
`
      break

    default:
      return `no sql!! `
      break
  }
}

export const SQL_FILTER_TEMPLATES: any = {
  postgres_logs: {
    'severity.error': `metadataParsed.error_severity = 'ERROR'`,
    'severity.log': `metadataParsed.error_severity = 'LOG'`,
  },
  edge_logs: {
    'status_code.error': `response.status_code between 500 and 599`,
    'status_code.success': `response.status_code between 200 and 299`,
    'status_code.warning': `response.status_code between 400 and 499`,

    'product.database': `request.path LIKE '/rest/%'`,
    'product.storage': `request.path LIKE '/storage/%'`,
    'product.auth': `request.path LIKE '/auth/%'`,
    'product.realtime': `request.path LIKE '/realtime/%'`,

    'method.get': `request.method = 'GET'`,
    'method.post': `request.method = 'POST'`,
    'method.del': `request.method = 'DEL'`,
    'method.options': `request.method = 'OPTIONS'`,
  },
}

// export const genDefaultQuery = (table: string, where: string = ''): string => `SELECT
//   id, timestamp, event_message, metadata
// FROM
//   ${table}${where ? ' WHERE\n  ' + where : ''}
// LIMIT 100
// `
export const cleanQuery = (str: string) => str.replaceAll(/\n/g, ' ')
// .replace(/\n.*\-\-.*(\n)?$?/, "")

export enum LogsTableName {
  EDGE = 'edge_logs',
  POSTGRES = 'postgres_logs',
}
export const genCountQuery = (table: string): string => `SELECT count(*) as count FROM ${table}`

export const genQueryParams = (params: { [k: string]: string }) => {
  // remove keys which are empty strings, null, or undefined
  for (const k in params) {
    const v = params[k]
    if (v === null || v === '' || v === undefined) {
      delete params[k]
    }
  }
  const qs = new URLSearchParams(params).toString()
  return qs
}

export const FILTER_OPTIONS: any = {
  // Postgres logs
  postgres_logs: {
    severity: {
      label: 'Severity',
      key: 'severity',
      options: [
        {
          key: 'error',
          label: 'Error',
          description: 'Show all events that have error severity',
        },
        {
          key: 'log',
          label: 'Log',
          description: 'Show all events that are log severity',
        },
      ],
    },
  },

  // Edge logs
  edge_logs: {
    status_code: {
      label: 'Status code',
      key: 'status_code',
      options: [
        {
          key: 'error',
          label: 'Error',
          description: '500 error codes',
        },
        {
          key: 'success',
          label: 'Success',
          description: '200 codes',
        },
        {
          key: 'warning',
          label: 'Warning',
          description: '400 codes',
        },
      ],
    },
    product: {
      label: 'Product',
      key: 'product',
      options: [
        {
          key: 'realtime',
          label: 'Realtime',
          description: '',
        },
        {
          key: 'storage',
          label: 'Storage',
          description: '',
        },
        {
          key: 'auth',
          label: 'Auth',
          description: '',
        },
        {
          key: 'database',
          label: 'Database',
          description: '',
        },
      ],
    },
    method: {
      label: 'Method',
      key: 'method',
      options: [
        {
          key: 'get',
          label: 'GET',
          description: '',
        },
        {
          key: 'options',
          label: 'OPTIONS',
          description: '',
        },
        {
          key: 'post',
          label: 'POST',
          description: '',
        },
      ],
    },
  },
}
