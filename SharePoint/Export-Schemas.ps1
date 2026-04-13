#Requires -Modules PnP.PowerShell
<#
.SYNOPSIS
  Exports SharePoint list column definitions to JSON under SharePoint/schemas/.

.DESCRIPTION
  Connects to the Digital Fabrication Lab site (interactive browser sign-in) and writes one JSON file per list.
  Re-run after you change columns so the repo matches production.

.NOTES
  Prerequisite: Install-Module PnP.PowerShell -Scope CurrentUser
  Site: https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$SiteUrl = 'https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab'
$ListNames = @(
  'PrintRequests',
  'AuditLog',
  'Staff',
  'BuildPlates',
  'Payments',
  'RequestComments'
)

$scriptDir = $PSScriptRoot
$outDir = Join-Path $scriptDir 'schemas'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "Connecting to $SiteUrl (browser sign-in)..." -ForegroundColor Cyan
Connect-PnPOnline -Url $SiteUrl -Interactive

foreach ($listName in $ListNames) {
  Write-Host "Exporting list: $listName" -ForegroundColor Cyan
  $list = Get-PnPList -Identity $listName -ErrorAction SilentlyContinue
  if (-not $list) {
    Write-Warning "List not found (check title/internal name): $listName"
    continue
  }

  $fieldRows = @()
  $fields = Get-PnPField -List $list.Id
  foreach ($f in $fields) {
    $choices = $null
    if ($f.TypeAsString -in @('Choice', 'MultiChoice') -and $f.Choices) {
      $choices = @($f.Choices)
    }

    $lookupListId = $null
    if ($f.LookupList) {
      $lookupListId = $f.LookupList.ToString()
    }

    $row = [ordered]@{
      InternalName    = $f.InternalName
      Title           = $f.Title
      Type            = $f.TypeAsString
      Required        = [bool]$f.Required
      Hidden          = [bool]$f.Hidden
      ReadOnlyField   = [bool]$f.ReadOnlyField
      Description     = $f.Description
      DefaultValue    = if ($f.DefaultValue) { $f.DefaultValue } else { $null }
      MaxLength       = if ($f.MaxLength -gt 0) { $f.MaxLength } else { $null }
      Choices         = $choices
      LookupListId    = $lookupListId
      LookupField     = if ($f.LookupField) { $f.LookupField } else { $null }
    }

    if ($f.TypeAsString -eq 'Calculated' -and $f.Formula) {
      $row['Formula'] = $f.Formula
    }
    if ($f.TypeAsString -eq 'Calculated' -and $f.OutputType) {
      $row['OutputType'] = $f.OutputType.ToString()
    }

    $fieldRows += [pscustomobject]$row
  }

  $payload = [ordered]@{
    exportedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    siteUrl       = $SiteUrl
    listTitle     = $list.Title
    listId        = $list.Id.ToString()
    fieldCount    = $fieldRows.Count
    fields        = $fieldRows
  }

  $outFile = Join-Path $outDir ("{0}-schema.json" -f $listName)
  ($payload | ConvertTo-Json -Depth 12) | Set-Content -LiteralPath $outFile -Encoding utf8
  Write-Host "  Wrote $outFile" -ForegroundColor Green
}

Write-Host "Done. Schema files are in: $outDir" -ForegroundColor Green
