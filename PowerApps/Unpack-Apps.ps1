#Requires -Version 5.1
<#
.SYNOPSIS
  Unpacks Staff Dashboard and Student Portal .msapp files into PowerApps/source/ using pac.

.DESCRIPTION
  Default paths expect .msapp files next to this script (PowerApps/StaffDashboard.msapp and StudentPortal.msapp).
  Export from Power Apps: File > Save as > This computer, then copy the files here or pass full paths.

.NOTES
  Requires Power Platform CLI (pac). Example install: winget install --id Microsoft.PowerAppsCLI -e
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string] $StaffMsapp,

  [Parameter(Mandatory = $false)]
  [string] $StudentMsapp
)

$ErrorActionPreference = 'Stop'

$powerAppsDir = $PSScriptRoot
$repoRoot = Split-Path $powerAppsDir -Parent

if (-not $StaffMsapp) {
  $StaffMsapp = Join-Path $powerAppsDir 'StaffDashboard.msapp'
}
if (-not $StudentMsapp) {
  $StudentMsapp = Join-Path $powerAppsDir 'StudentPortal.msapp'
}

$staffOut = Join-Path $powerAppsDir 'source\StaffDashboard'
$studentOut = Join-Path $powerAppsDir 'source\StudentPortal'

function Invoke-Unpack {
  param(
    [string] $MsappPath,
    [string] $SourcesDir,
    [string] $Label
  )

  if (-not (Test-Path -LiteralPath $MsappPath)) {
    Write-Warning "Skipping $Label — file not found: $MsappPath"
    Write-Host "  Export the app from Power Apps, then copy the .msapp to that path or use -StaffMsapp / -StudentMsapp." -ForegroundColor Yellow
    return
  }

  $resolvedMsapp = (Resolve-Path -LiteralPath $MsappPath).Path
  New-Item -ItemType Directory -Force -Path $SourcesDir | Out-Null
  $resolvedSources = (Resolve-Path -LiteralPath $SourcesDir).Path

  Write-Host "Unpacking $Label..." -ForegroundColor Cyan
  & pac canvas unpack --msapp $resolvedMsapp --sources $resolvedSources
  if ($LASTEXITCODE -ne 0) {
    throw "pac canvas unpack failed for $Label (exit code $LASTEXITCODE)"
  }
  Write-Host "  -> $resolvedSources" -ForegroundColor Green
}

Push-Location $repoRoot
try {
  Invoke-Unpack -MsappPath $StaffMsapp -SourcesDir $staffOut -Label 'StaffDashboard'
  Invoke-Unpack -MsappPath $StudentMsapp -SourcesDir $studentOut -Label 'StudentPortal'
}
finally {
  Pop-Location
}

Write-Host "Done." -ForegroundColor Green
