
$cacheDir = "D:\网络营销\AI内容创作工作平台资料\官网建设\.test-cache"
$files = Get-ChildItem $cacheDir -Filter "*.html"
$forbidden = @("订阅自动续费","自动续费","年费订阅","在线订阅","年费套餐","提升疗效","疗效提升","治愈率","治愈","降低误诊","诊断建议","治疗建议","诊疗建议","医疗广告生成","0成本","零成本","永不宕机","100%一键发布","一键自动发布","全自动成片","效率提升90","成本降低80","效率提升95")
$review = @("仅供参考","保证100","包治","官方认证疗效")
$placeholders = @("待确认","example.com","00000000")

$issues = @()
foreach ($f in $files) {
  $html = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
  $name = $f.Name
  $title = if ($html -match '<title>([^<]*)</title>') { $Matches[1] } else { "MISSING" }
  if (-not ($html -match '<meta name="description" content="[^"]*"')) { $issues += "$name : MISSING meta description" }
  if (-not ($html -match '<link rel="canonical" href="[^"]*"')) { $issues += "$name : MISSING canonical" }
  $h1n = ([regex]::Matches($html, '<h1[^>]*>')).Count
  if ($h1n -ne 1) { $issues += "$name : h1 count=$h1n" }
  if (-not $html.Contains('name="viewport"')) { $issues += "$name : missing viewport" }
  if (-not ($html -match '<html lang="zh-CN"')) { $issues += "$name : missing lang=zh-CN" }
  $ld = ([regex]::Matches($html, 'type="application/ld+json"')).Count
  foreach ($w in $forbidden) { if ($html.Contains($w)) { $issues += "$name : FORBIDDEN [ $w ]" } }
  foreach ($w in $review) { if ($html.Contains($w)) { $issues += "$name : REVIEW-WORD [ $w ] (human check)" } }
  if ($html.Contains([char]0xFFFD)) { $issues += "$name : MOJIBAKE U+FFFD" }
  $foundPh = @()
  foreach ($w in $placeholders) { if ($html.Contains($w)) { $foundPh += $w } }
  if ($foundPh.Count -gt 0) { $issues += "$name : PLACEHOLDERS -> " + (($foundPh | Select-Object -Unique) -join ", ") }
  Write-Output ("{0,-55} h1={1} jsonLd={2}  {3}" -f $name, $h1n, $ld, $title)
}
Write-Output ""
Write-Output "=== ISSUES ($($issues.Count)) ==="
$issues | ForEach-Object { Write-Output ("  " + $_) }
