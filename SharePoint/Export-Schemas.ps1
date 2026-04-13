#Requires -Version 7.4
#Requires -Modules PnP.PowerShell
<#
.SYNOPSIS
  Exports SharePoint list column definitions to JSON under SharePoint/schemas/.

.DESCRIPTION
  Connects to the Digital Fabrication Lab site and writes one JSON file per list.
  Re-run after you change columns so the repo matches production.

  Many universities (including LSU) block the default multi-tenant PnP client ID and return
  AADSTS700016. Use -ClientId with an Entra app registration in YOUR tenant (admin-consented),
  or set environment variable PNP_CLIENT_ID to that app's Application (client) ID.

.NOTES
  Run with PowerShell 7: pwsh
  Prerequisite: Install-Module PnP.PowerShell -Scope CurrentUser
  Site: https://lsumail2.sharepoint.com/sites/Team-ASDN-DigitalFabricationLab
  Registration guide: https://pnp.github.io/powershell/articles/registerapplication.html
#>
[CmdletBinding()]
param(
  [string] $ClientId = $env:PNP_CLIENT_ID,
  [string] $Tenant,
  [switch] $DeviceLogin
)

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

$connectParams = @{ Url = $SiteUrl }
if ($ClientId) {
  $connectParams.ClientId = $ClientId
}
if ($Tenant) {
  $connectParams.Tenant = $Tenant
}

if ($DeviceLogin) {
  Write-Host "Connecting to $SiteUrl (device code — open the URL and enter the code)..." -ForegroundColor Cyan
  Connect-PnPOnline @connectParams -DeviceLogin
}
else {
  Write-Host "Connecting to $SiteUrl (browser sign-in)..." -ForegroundColor Cyan
  Connect-PnPOnline @connectParams -Interactive
}

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
