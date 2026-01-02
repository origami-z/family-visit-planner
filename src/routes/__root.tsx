import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'

export function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Family Visit Planner</title>
        <link rel="stylesheet" href={appCss} />
      </head>
      <body>
        {children}
        <TanStackDevtools config={{ position: 'bottom-right' }} />
      </body>
    </html>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Family Visit Planner</title>
        <link rel="stylesheet" href={appCss} />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </body>
    </html>
  )
}
