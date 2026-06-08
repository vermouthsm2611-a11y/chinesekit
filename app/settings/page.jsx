// Không dùng force-dynamic — saveSettings action sẽ revalidate đúng path
import { getSettings } from '@/lib/settings'
import { saveSettings } from '@/app/actions/settings'
import SettingsForm from '@/components/settings/SettingsForm'

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <div>
      <h1 className="text-xl font-medium text-gray-900 mb-6">Cài đặt</h1>
      <SettingsForm action={saveSettings} settings={settings} />
    </div>
  )
}
