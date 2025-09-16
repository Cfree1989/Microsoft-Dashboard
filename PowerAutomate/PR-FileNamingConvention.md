# File Naming Convention Functions

## Standardized File Naming Convention
**Format:** `FirstAndLastName_PrintMethod_Color_SimpleJobID.original_extension`  
**Example:** `JaneDoe_Filament_Blue_123.stl`

---

## Power Automate Expression

Use this expression in your PR-Create flow to generate the standardized filename:

### Compose Action: "Generate Standardized Filename"
```javascript
@{concat(
  replace(replace(replace(replace(replace(triggerOutputs()?['body/Student/DisplayName'], ' ', ''), '-', ''), '''', ''), '.', ''), ',', ''),
  '_',
  triggerOutputs()?['body/Method'],
  '_', 
  triggerOutputs()?['body/Color'],
  '_',
  right(outputs('Compose ReqKey'), 5),
  '.',
  last(split(triggerOutputs()?['body/Attachments'][0]['Name'], '.'))
)}
```

### Breakdown of the Expression:
1. **FirstAndLastName**: `replace(replace(replace(replace(replace(triggerOutputs()?['body/Student/DisplayName'], ' ', ''), '-', ''), '''', ''), '.', ''), ',', '')` 
   - Removes spaces, hyphens, apostrophes, periods, and commas from student name
2. **PrintMethod**: `triggerOutputs()?['body/Method']` (Filament or Resin)
3. **Color**: `triggerOutputs()?['body/Color']` 
4. **SimpleJobID**: `right(outputs('Compose ReqKey'), 5)` (extracts "00001" from "REQ-00001")
5. **Extension**: `last(split(triggerOutputs()?['body/Attachments'][0]['Name'], '.'))` (gets original extension)

---

## PowerShell Function

For use in provisioning scripts or SharePoint management:

```powershell
function New-StandardizedFilename {
    param(
        [Parameter(Mandatory=$true)]
        [string]$StudentName,
        
        [Parameter(Mandatory=$true)]
        [string]$Method,
        
        [Parameter(Mandatory=$true)]
        [string]$Color,
        
        [Parameter(Mandatory=$true)]
        [string]$ReqKey,
        
        [Parameter(Mandatory=$true)]
        [string]$OriginalFilename
    )
    
    # Clean student name - remove spaces, hyphens, apostrophes, periods, commas
    $CleanName = $StudentName -replace '[ \-\'\.,]', ''
    
    # Extract simple ID from ReqKey (e.g., "REQ-00001" becomes "00001")
    $SimpleID = $ReqKey -replace 'REQ-', ''
    
    # Get file extension
    $Extension = [System.IO.Path]::GetExtension($OriginalFilename)
    
    # Build standardized filename
    $StandardizedName = "$CleanName" + "_$Method" + "_$Color" + "_$SimpleID" + "$Extension"
    
    return $StandardizedName
}

# Example usage:
# $NewName = New-StandardizedFilename -StudentName "Jane Doe" -Method "Filament" -Color "Blue" -ReqKey "REQ-00001" -OriginalFilename "model.stl"
# Result: "JaneDoe_Filament_Blue_00001.stl"
```

---

## Implementation in Your System

### 1. Update PR-Create Flow
Add the "Generate Standardized Filename" compose action after creating the ReqKey but before updating the SharePoint item.

### 2. Update the SharePoint Update Action
In your "Update item" step, add:
- **Title**: Use the standardized filename (without extension) as the display name
- **Custom Field**: Store the standardized filename for reference

### 3. File Attachment Handling
If you need to rename the actual attachment file, you'll need to:
1. Download the attachment
2. Re-upload with the new name
3. Delete the original

### Example Flow Sequence:
1. **Compose ReqKey**: Generate REQ-00001
2. **Compose Standardized Filename**: Generate JaneDoe_Filament_Blue_00001.stl
3. **Update item**: Update SharePoint with standardized naming
4. **Create AuditLog entry**: Log the renaming action

---

## Benefits of This Naming Convention

✅ **Consistency**: All files follow identical naming pattern  
✅ **Searchability**: Easy to find files by student, method, or color  
✅ **Sortability**: Files sort logically by name  
✅ **Collision Prevention**: SimpleJobID ensures unique filenames  
✅ **Metadata Embedded**: Key information visible in filename  
✅ **Cross-Platform Safe**: No special characters that cause filesystem issues  

---

## Character Cleaning Rules

The following characters are removed from student names to ensure filesystem compatibility:
- **Spaces** → Removed (Jane Doe → JaneDoe)
- **Hyphens** → Removed (Mary-Jane → MaryJane) 
- **Apostrophes** → Removed (O'Connor → OConnor)
- **Periods** → Removed (Jr. → Jr)
- **Commas** → Removed (Smith, John → SmithJohn)

This ensures filenames work across Windows, Mac, and Linux filesystems without issues.
