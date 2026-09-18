import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import { useApi, useMutation } from '../../hooks/useApi'
import { getSettings, createOrUpdateSetting } from '../../api/settingsApi'

export default function SettingsPage() {
  const { data: settings = [], isLoading, error, refetch } = useApi(getSettings, [])
  const { mutate, isSubmitting } = useMutation(createOrUpdateSetting)
  const [form, setForm] = useState({ settingKey: 'company_name', settingValue: '' })

  // populate initial value when settings load
  if (!isLoading && settings && form.settingValue === '') {
    const existing = settings.find((s) => s.settingKey === 'company_name')
    if (existing) setForm({ settingKey: 'company_name', settingValue: existing.settingValue })
  }

  const onChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await mutate({ settingKey: form.settingKey, settingValue: form.settingValue })
      toast.success('Settings saved')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to save settings')
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="Application settings and company information." />

      <form onSubmit={onSubmit} className="max-w-lg space-y-6">
        <Input label="Company name" value={form.settingValue} onChange={onChange('settingValue')} required />

        <div>
          <Button type="submit" isLoading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>

      {error && <div className="mt-4 text-sm text-red-500">Failed to load settings</div>}
    </div>
  )
}
