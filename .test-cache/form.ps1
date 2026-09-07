
$cacheDir = "D:\网络营销\AI内容创作工作平台资料\官网建设\.test-cache"
foreach ($name in @("trial.html","demo.html","partners.html")) {
  $html = [System.IO.File]::ReadAllText((Join-Path $cacheDir $name), [System.Text.Encoding]::UTF8)
  Write-Output ("======== " + $name + " ========")
  $formM = [regex]::Match($html, '<form[^>]*>')
  if ($formM.Success) { Write-Output ("FORM tag: " + $formM.Value) } else { Write-Output "NO <form> found!" }
  $fields = [regex]::Matches($html, '<(?:input|select|textarea)[^>]*>')
  foreach ($fld in $fields) {
    $tag = $fld.Value
    $nm = "-"; $tp = "-"; $ph = ""
    if ($tag -match 'name="([^"]*)"') { $nm = $Matches[1] }
    if ($tag -match 'type="([^"]*)"') { $tp = $Matches[1] }
    if ($tag -match '<select') { $tp = "select" }
    if ($tag -match '<textarea') { $tp = "textarea" }
    $req = ""
    if ($tag -match 'required') { $req = "REQ" }
    if ($tag -match 'placeholder="([^"]*)"') { $ph = $Matches[1] }
    Write-Output ("  field: name=" + $nm + " type=" + $tp + " " + $req + "  ph=" + $ph)
  }
  Write-Output ("  has privacy_consent: " + $html.Contains("privacy_consent"))
  Write-Output ("  has submission_id: " + $html.Contains("submission_id"))
  Write-Output ("  data-lead-form attr: " + [regex]::Match($html, 'data-lead-form="[^"]*"').Value)
  $btnM = [regex]::Match($html, '<button[^>]*>[^<]*</button>')
  if ($btnM.Success) { Write-Output ("  submit button: " + $btnM.Value) }
  Write-Output ""
}
