<#!
.SYNOPSIS
Provision SharePoint lists, columns, views, permissions, and column formatting for the FabLab 3D Print MVP.

.REQUIREMENTS
- PowerShell 7+ recommended
- PnP.PowerShell module
  Install-Module PnP.PowerShell -Scope CurrentUser

.USAGE
  pwsh ./Provision-FabLab.ps1 -SiteUrl "https://<tenant>.sharepoint.com/sites/FabLab"

#>
#Requires -Version 7.2
#Requires -Modules PnP.PowerShell
param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl
)

$ErrorActionPreference = 'Stop'

Import-Module PnP.PowerShell -ErrorAction Stop

Write-Host "Connecting to $SiteUrl ..." -ForegroundColor Cyan
try { Connect-PnPOnline -Url $SiteUrl -Interactive } catch { throw }

function Initialize-List {
  param(
    [string]$Title,
    [ValidateSet('GenericList','DocumentLibrary')]
    [string]$Template = 'GenericList',
    [switch]$EnableAttachments
  )
  $list = Get-PnPList -Identity $Title -ErrorAction SilentlyContinue
  if(-not $list){
    Write-Host "Creating list: $Title" -ForegroundColor Green
    Add-PnPList -Title $Title -Template $Template -OnQuickLaunch
  } else { Write-Host "List exists: $Title" -ForegroundColor Yellow }

  if($EnableAttachments.IsPresent){
    try { Set-PnPList -Identity $Title -EnableAttachments $true } catch {}
  }
  # Always enable versioning
  Set-PnPList -Identity $Title -EnableVersioning $true
}

# === Create Lists ===
Initialize-List -Title 'PrintRequests' -Template 'GenericList' -EnableAttachments
Initialize-List -Title 'AuditLog' -Template 'GenericList'
Initialize-List -Title 'Staff' -Template 'GenericList'

# === Fields for PrintRequests ===
Write-Host "Adding fields to PrintRequests ..." -ForegroundColor Cyan
$listName = 'PrintRequests'

function Add-TextField { param([string]$DisplayName,[string]$InternalName,[int]$MaxLength=255,[switch]$Required,[switch]$Unique)
  $existing = Get-PnPField -List $listName -Identity $InternalName -ErrorAction SilentlyContinue
  if(-not $existing){
    Add-PnPField -List $listName -DisplayName $DisplayName -InternalName $InternalName -Type Text -AddToDefaultView | Out-Null
    if($Required){ Set-PnPField -List $listName -Identity $InternalName -Values @{Required=$true} }
    if($Unique){ Set-PnPField -List $listName -Identity $InternalName -Values @{EnforceUniqueValues=$true} }
  }
}
function Add-NoteField { param([string]$DisplayName,[string]$InternalName,[switch]$Append)
  $existing = Get-PnPField -List $listName -Identity $InternalName -ErrorAction SilentlyContinue
  if(-not $existing){ Add-PnPField -List $listName -DisplayName $DisplayName -InternalName $InternalName -Type Note -AddToDefaultView | Out-Null }
}
function Add-NumberField { param([string]$DisplayName,[string]$InternalName)
  $existing = Get-PnPField -List $listName -Identity $InternalName -ErrorAction SilentlyContinue
  if(-not $existing){ Add-PnPField -List $listName -DisplayName $DisplayName -InternalName $InternalName -Type Number -AddToDefaultView | Out-Null }
}
function Add-YesNoField { param([string]$DisplayName,[string]$InternalName,[switch]$DefaultYes)
  $existing = Get-PnPField -List $listName -Identity $InternalName -ErrorAction SilentlyContinue
  if(-not $existing){ Add-PnPField -List $listName -DisplayName $DisplayName -InternalName $InternalName -Type Boolean -AddToDefaultView | Out-Null }
  if($DefaultYes){ Set-PnPField -List $listName -Identity $InternalName -Values @{DefaultValue='1'} }
}
function Add-DateField { param([string]$DisplayName,[string]$InternalName)
  $existing = Get-PnPField -List $listName -Identity $InternalName -ErrorAction SilentlyContinue
  if(-not $existing){ Add-PnPField -List $listName -DisplayName $DisplayName -InternalName $InternalName -Type DateTime -AddToDefaultView | Out-Null }
}
function Add-PersonField { param([string]$DisplayName,[string]$InternalName,[switch]$AllowGroups)
  $existing = Get-PnPField -List $listName -Identity $InternalName -ErrorAction SilentlyContinue
  if(-not $existing){ Add-PnPField -List $listName -DisplayName $DisplayName -InternalName $InternalName -Type User -AddToDefaultView | Out-Null }
}
function Add-ChoiceField {
  param([string]$DisplayName,[string]$InternalName,[string[]]$Choices,[string]$Default)
  $existing = Get-PnPField -List $listName -Identity $InternalName -ErrorAction SilentlyContinue
  if(-not $existing){
    Add-PnPField -List $listName -DisplayName $DisplayName -InternalName $InternalName -Type Choice -Choices $Choices -AddToDefaultView | Out-Null
  }
  if($Default){ Set-PnPField -List $listName -Identity $InternalName -Values @{DefaultValue=$Default} }
}

# Core fields
Add-TextField -DisplayName 'ReqKey' -InternalName 'ReqKey' -Unique
Add-PersonField -DisplayName 'Student' -InternalName 'Student'
Add-TextField -DisplayName 'StudentEmail' -InternalName 'StudentEmail'
Add-TextField -DisplayName 'Course/Section' -InternalName 'Course'
Add-ChoiceField -DisplayName 'Department' -InternalName 'Department' -Choices @('Architecture','Engineering','Art & Design','Other')
Add-ChoiceField -DisplayName 'Project Type' -InternalName 'ProjectType' -Choices @('Class Project','Research','Personal','Other')
Add-NumberField -DisplayName 'Quantity' -InternalName 'Quantity'
Add-ChoiceField -DisplayName 'Material' -InternalName 'Material' -Choices @('PLA','PETG','ABS','Resin','Other')
Add-ChoiceField -DisplayName 'Color' -InternalName 'Color' -Choices @('Any','Black','White','Gray','Red','Green','Blue','Yellow','Other')
Add-NumberField -DisplayName 'Infill %' -InternalName 'Infill'
Add-ChoiceField -DisplayName 'Layer Height (mm)' -InternalName 'LayerHeight' -Choices @('0.08','0.12','0.16','0.2','0.28')
Add-YesNoField -DisplayName 'Supports' -InternalName 'Supports'
Add-YesNoField -DisplayName 'Rafts' -InternalName 'Rafts'
Add-DateField -DisplayName 'Due Date' -InternalName 'DueDate'
Add-TextField -DisplayName 'Dimensions (mm)' -InternalName 'Dimensions'
Add-NoteField -DisplayName 'Notes' -InternalName 'Notes'
Add-ChoiceField -DisplayName 'Status' -InternalName 'Status' -Choices @('Submitted','Intake Review','Needs Info','Approved','Rejected','Queued','Printing','Paused','Failed','Completed','Ready for Pickup','Picked Up','Canceled') -Default 'Submitted'
Add-ChoiceField -DisplayName 'Priority' -InternalName 'Priority' -Choices @('Low','Normal','High','Rush')
Add-PersonField -DisplayName 'Assigned To' -InternalName 'AssignedTo'
Add-NumberField -DisplayName 'Estimated Hours' -InternalName 'EstHours'
Add-NoteField -DisplayName 'Staff Notes' -InternalName 'StaffNotes'
Add-ChoiceField -DisplayName 'Last Action' -InternalName 'LastAction' -Choices @('Created','Updated','Status Change','File Added','Needs Info','Approved','Rejected','Queued','Printing','Paused','Failed','Completed','Ready for Pickup','Picked Up','Canceled','Comment Added','Email Sent')
Add-PersonField -DisplayName 'Last Action By' -InternalName 'LastActionBy'
Add-DateField -DisplayName 'Last Action At' -InternalName 'LastActionAt'
Add-TextField -DisplayName 'Student LSU ID' -InternalName 'StudentLSUID'

# Set item-level permissions (students see only their items)
Write-Host "Configuring item-level permissions ..." -ForegroundColor Cyan
Set-PnPList -Identity $listName -ReadSecurity 2 -WriteSecurity 2

# Add indexes for performance
Write-Host "Adding indexes ..." -ForegroundColor Cyan
try { Add-PnPFieldIndex -List $listName -Field 'ReqKey' -ErrorAction SilentlyContinue } catch {}
try { Add-PnPFieldIndex -List $listName -Field 'Status' -ErrorAction SilentlyContinue } catch {}
try { Add-PnPFieldIndex -List $listName -Field 'Modified' -ErrorAction SilentlyContinue } catch {}

# Add views
Write-Host "Creating views ..." -ForegroundColor Cyan
$fieldsDefault = @('LinkTitle','ReqKey','Status','Priority','AssignedTo','Modified','Editor')
$view = Get-PnPView -List $listName -Identity 'All Items'
if($view){ Set-PnPView -List $listName -Identity $view -Fields $fieldsDefault }

if(-not (Get-PnPView -List $listName -Identity 'My Requests' -ErrorAction SilentlyContinue)){
  Add-PnPView -List $listName -Title 'My Requests' -Fields $fieldsDefault -Query '<Where><Eq><FieldRef Name="Author"/><Value Type="Integer"><UserID/></Value></Eq></Where>' | Out-Null
}
if(-not (Get-PnPView -List $listName -Identity 'Staff – Queue' -ErrorAction SilentlyContinue)){
  $query = '<Where><Or><Or><Or><Or><Eq><FieldRef Name="Status"/><Value Type="Choice">Submitted</Value></Eq><Eq><FieldRef Name="Status"/><Value Type="Choice">Intake Review</Value></Eq></Or><Eq><FieldRef Name="Status"/><Value Type="Choice">Approved</Value></Eq></Or><Eq><FieldRef Name="Status"/><Value Type="Choice">Queued</Value></Eq></Or><Eq><FieldRef Name="Status"/><Value Type="Choice">Printing</Value></Eq></Or></Where><OrderBy><FieldRef Name="Modified" Ascending="FALSE"/></OrderBy>'
  Add-PnPView -List $listName -Title 'Staff – Queue' -Fields $fieldsDefault -Query $query | Out-Null
}

# Apply column formatting to Status
Write-Host "Applying Status column formatting ..." -ForegroundColor Cyan
$formatPath = Join-Path $PSScriptRoot 'StatusColumnFormat.json'
if(Test-Path $formatPath){
  $json = Get-Content $formatPath -Raw
  Set-PnPField -List $listName -Identity 'Status' -Values @{ CustomFormatter = $json }
}

# === AuditLog fields ===
Write-Host "Adding fields to AuditLog ..." -ForegroundColor Cyan
$listName = 'AuditLog'
Add-TextField -DisplayName 'ReqKey' -InternalName 'ReqKey'
Add-NumberField -DisplayName 'Request ID' -InternalName 'RequestID'
Add-ChoiceField -DisplayName 'Action' -InternalName 'Action' -Choices @('Created','Updated','Status Change','File Added','Comment Added','Assigned','Email Sent','System')
Add-TextField -DisplayName 'Field Name' -InternalName 'FieldName'
Add-NoteField -DisplayName 'Old Value' -InternalName 'OldValue'
Add-NoteField -DisplayName 'New Value' -InternalName 'NewValue'
Add-PersonField -DisplayName 'Actor' -InternalName 'Actor'
Add-ChoiceField -DisplayName 'Actor Role' -InternalName 'ActorRole' -Choices @('Student','Staff','System')
Add-DateField -DisplayName 'Action At' -InternalName 'ActionAt'
Add-NoteField -DisplayName 'Notes' -InternalName 'Notes'
Add-ChoiceField -DisplayName 'Client App' -InternalName 'ClientApp' -Choices @('SharePoint Form','Power Apps','Power Automate')
Add-TextField -DisplayName 'Flow Run ID' -InternalName 'FlowRunId'

# Optional Lookup to PrintRequests by ID
if(-not (Get-PnPField -List 'AuditLog' -Identity 'Request' -ErrorAction SilentlyContinue)){
  Add-PnPField -List 'AuditLog' -DisplayName 'Request' -InternalName 'Request' -Type Lookup -LookupList 'PrintRequests' -LookupField 'ID' -AddToDefaultView | Out-Null
}

# Add indexes on AuditLog
Write-Host "Adding indexes on AuditLog ..." -ForegroundColor Cyan
try { Add-PnPFieldIndex -List $listName -Field 'RequestID' -ErrorAction SilentlyContinue } catch {}
try { Add-PnPFieldIndex -List $listName -Field 'ReqKey' -ErrorAction SilentlyContinue } catch {}
try { Add-PnPFieldIndex -List $listName -Field 'ActionAt' -ErrorAction SilentlyContinue } catch {}

# === Staff fields ===
Write-Host "Adding fields to Staff ..." -ForegroundColor Cyan
$listName = 'Staff'
Add-PersonField -DisplayName 'Member' -InternalName 'Member'
Add-ChoiceField -DisplayName 'Role' -InternalName 'Role' -Choices @('Manager','Technician','Student Worker')
Add-YesNoField -DisplayName 'Active' -InternalName 'Active'

Write-Host "Provisioning complete." -ForegroundColor Green
