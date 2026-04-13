#Requires -Version 5.1
<#
.SYNOPSIS
  Packs unpacked canvas app folders under PowerApps/source/ back into .msapp files using pac.

.DESCRIPTION
  Default output paths write next to this script:
    PowerApps/StaffDashboard.msapp
    PowerApps/StudentPortal.msapp
  Open the .msapp in Power Apps Studio, then save to the cloud and publish when ready.

  Requires a prior unpack (or a valid sources tree with CanvasManifest.json).

.PARAMETER StaffMsapp
  Output path for Staff Dashboard .msapp.

.PARAMETER StudentMsapp
  Output path for Student Portal .msapp.

.PARAMETER StaffOnly
  Pack only StaffDashboard (skip StudentPortal).

.PARAMETER StudentOnly
  Pack only StudentPortal (skip StaffDashboard).

.NOTES
  Requires Power Platform CLI (pac). Example install: winget install --id Microsoft.PowerAppsCLI -e
#>
param(
  [string] $StaffMsapp,
  [string] $StudentMsapp,
  [switch] $StaffOnly,
  [switch] $StudentOnly
)

$ErrorActionPreference = 'Stop'

if ($StaffOnly -and $StudentOnly) {
  throw 'Use only one of -StaffOnly or -StudentOnly, not both.'
}

$powerAppsDir = $PSScriptRoot
$repoRoot = Split-Path $powerAppsDir -Parent

if (-not $StaffMsapp) {
  $StaffMsapp = Join-Path $powerAppsDir 'StaffDashboard.msapp'
}
if (-not $StudentMsapp) {
  $StudentMsapp = Join-Path $powerAppsDir 'StudentPortal.msapp'
}

$staffSources = Join-Path $powerAppsDir 'source\StaffDashboard'
$studentSources = Join-Path $powerAppsDir 'source\StudentPortal'

function Test-CanvasSources {
  param([string] $SourcesDir)
  $manifest = Join-Path $SourcesDir 'CanvasManifest.json'
  return (Test-Path -LiteralPath $manifest)
}

function Invoke-Pack {
  param(
    [string] $MsappPath,
    [string] $SourcesDir,
    [string] $Label
  )

  if (-not (Test-Path -LiteralPath $SourcesDir)) {
    Write-Warning "Skipping $Label — sources folder not found: $SourcesDir"
    return
  }

  if (-not (Test-CanvasSources -SourcesDir $SourcesDir)) {
    Write-Warning "Skipping $Label — not a valid unpacked app (missing CanvasManifest.json): $SourcesDir"
    return
  }

  $resolvedSources = (Resolve-Path -LiteralPath $SourcesDir).Path
  # Avoid Split-Path -LiteralPath -Parent (ambiguous parameter set on Windows PowerShell 5.1)
  $msappParent = [System.IO.Path]::GetDirectoryName($MsappPath)
  if ([string]::IsNullOrEmpty($msappParent)) {
    $msappParent = $powerAppsDir
  }
  if (-not (Test-Path -LiteralPath $msappParent)) {
    New-Item -ItemType Directory -Force -Path $msappParent | Out-Null
  }
  $resolvedMsapp = $MsappPath

  Write-Host "Packing $Label..." -ForegroundColor Cyan
  Write-Host "  sources: $resolvedSources" -ForegroundColor DarkGray
  Write-Host "  msapp:   $resolvedMsapp" -ForegroundColor DarkGray

  & pac canvas pack --sources $resolvedSources --msapp $resolvedMsapp
  if ($LASTEXITCODE -ne 0) {
    throw "pac canvas pack failed for $Label (exit code $LASTEXITCODE)"
  }
  Write-Host "  -> $resolvedMsapp" -ForegroundColor Green
}

Push-Location $repoRoot
try {
  if (-not $StudentOnly) {
    Invoke-Pack -MsappPath $StaffMsapp -SourcesDir $staffSources -Label 'StaffDashboard'
  }
  if (-not $StaffOnly) {
    Invoke-Pack -MsappPath $StudentMsapp -SourcesDir $studentSources -Label 'StudentPortal'
  }
}
finally {
  Pop-Location
}

Write-Host "Done." -ForegroundColor Green
