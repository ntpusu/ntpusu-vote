import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('admin voting list exposes candidate names without ballot counts', async () => {
  const api = await readSource('server/api/voting/getAll.get.ts')
  const page = await readSource('pages/admin/editVoting.vue')

  assert.match(api, /candidates:\s*{[\s\S]*select:\s*{[\s\S]*name:\s*true/)
  assert.doesNotMatch(api, /ballots|_count/)
  assert.match(page, /title="投票選項"/)
  assert.match(page, /showCandidates/)
  assert.doesNotMatch(page, /票數/)
})

test('site info can be managed from admin UI and rendered publicly', async () => {
  const updateApi = await readSource('server/api/siteInfo/update.put.ts')
  const getApi = await readSource('server/api/siteInfo/get.get.ts')
  const page = await readSource('pages/admin/editInfo.vue')
  const bulletin = await readSource('pages/bulletin.vue')
  const app = await readSource('app.vue')

  assert.match(updateApi, /event\.context\.isAdmin/)
  assert.match(updateApi, /bulletinUrl/)
  assert.match(updateApi, /guideUrl/)
  assert.match(updateApi, /guideSource/)
  assert.match(getApi, /process\.env\.PDF_URL/)
  assert.match(getApi, /process\.env\.IG_POST_URL/)
  assert.match(page, /管理資訊/)
  assert.match(page, /Instagram/)
  assert.match(page, /Google Drive/)
  assert.match(bulletin, /\/api\/siteInfo\/get/)
  assert.match(app, /\/admin\/editInfo/)
})

test('super admin reset clears persisted site info with the rest of database', async () => {
  const resetApi = await readSource('server/api/superAdmin/add.put.ts')

  assert.match(resetApi, /TRUNCATE TABLE/)
  assert.match(resetApi, /RESTART IDENTITY CASCADE/)
  assert.match(resetApi, /"SiteSetting"/)
  assert.match(resetApi, /tx\.superAdmin\.create/)
})
