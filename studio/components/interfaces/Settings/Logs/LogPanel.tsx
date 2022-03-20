import React, { FC, useEffect, useState } from 'react'
import {
  Button,
  Input,
  Dropdown,
  Typography,
  IconChevronDown,
  IconRefreshCw,
  IconX,
  Toggle,
  IconSearch,
  IconClock,
  Popover,
  IconPlay,
} from '@supabase/ui'
import { LogSearchCallback, LogTemplate } from '.'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
interface Props {
  defaultSearchValue?: string
  defaultToValue?: string
  templates?: any
  isLoading: boolean
  isCustomQuery: boolean
  newCount: number
  onRefresh?: () => void
  onSearch?: LogSearchCallback
  onCustomClick?: () => void
  onSelectTemplate: (template: LogTemplate) => void
  isShowingEventChart: boolean
  onToggleEventChart: () => void

  editorControls: React.ReactNode
}

dayjs.extend(utc)

/**
 * Logs control panel header + wrapper
 */
const LogPanel: FC<Props> = ({
  templates = [],
  isLoading,
  isCustomQuery,
  newCount,
  onRefresh,
  onSearch = () => {},
  defaultSearchValue = '',
  defaultToValue = '',
  onCustomClick,
  onSelectTemplate,
  isShowingEventChart,
  onToggleEventChart,

  editorControls,
}) => {
  const [search, setSearch] = useState('')
  const [to, setTo] = useState({ value: '', error: '' })
  const [defaultTimestamp, setDefaultTimestamp] = useState(dayjs().utc().toISOString())

  // Sync local state with provided default value
  useEffect(() => {
    if (search !== defaultSearchValue) {
      setSearch(defaultSearchValue)
    }
  }, [defaultSearchValue])

  useEffect(() => {
    if (to.value !== defaultToValue) {
      setTo({ value: defaultToValue, error: '' })
    }
  }, [defaultToValue])

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value !== '' && isNaN(Date.parse(value))) {
      setTo({ value, error: 'Invalid ISO 8601 timestamp' })
    } else {
      setTo({ value, error: '' })
    }
  }
  const handleFromReset = async () => {
    setTo({ value: '', error: '' })
    const value = dayjs().utc().toISOString()
    setDefaultTimestamp(value)
    onSearch({ query: search, to: '' })
  }

  const handleSearch = () => onSearch({ query: search, to: to.value })

  const showFromReset = to.value !== ''
  return (
    <div
      className="
    border
    border-panel-border-light dark:border-panel-border-dark rounded rounded-bl-none rounded-br-none
    bg-panel-header-light dark:bg-panel-header-dark
    
    "
    >
      <div className="px-5 py-2 flex items-center justify-between w-full">
        <div className="flex flex-row gap-x-4 items-center">
          {!isCustomQuery && (
            <Button
              type="text"
              icon={
                <div className="relative">
                  {newCount > 0 && (
                    <div
                      className={[
                        'absolute flex items-center justify-center -top-3 right-3',
                        'h-4 w-4 z-50',
                      ].join(' ')}
                    >
                      <div className="absolute z-20">
                        <Typography.Text style={{ fontSize: '0.6rem' }} className="opacity-80">
                          {newCount}
                        </Typography.Text>
                      </div>
                      <div className="bg-green-800 rounded-full w-full h-full animate-ping opacity-60"></div>
                      <div className="absolute z-60 top-0 right-0 bg-green-900 opacity-80 rounded-full w-full h-full"></div>
                    </div>
                  )}
                  <IconRefreshCw />
                </div>
              }
              loading={isLoading}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}
          <Dropdown
            side="bottom"
            align="start"
            overlay={templates.map((template: LogTemplate) => (
              <Dropdown.Item key={template.label} onClick={() => onSelectTemplate(template)}>
                <Typography.Text>{template.label}</Typography.Text>
              </Dropdown.Item>
            ))}
          >
            <Button as="span" type="default" iconRight={<IconChevronDown />}>
              Templates
            </Button>
          </Dropdown>
        </div>
        {editorControls}
      </div>
    </div>
  )
}

export default LogPanel
