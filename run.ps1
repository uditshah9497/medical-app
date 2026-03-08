# Helper script to run npm commands with proper PATH
# Usage: .\run.ps1 <command>
# Example: .\run.ps1 test
# Example: .\run.ps1 build

param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

# Refresh PATH to include Node.js
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Run the npm command
switch ($Command) {
    "install" { npm install }
    "test" { npm test }
    "build" { npm run build }
    "local" { npm run local }
    "local:init" { npm run local:init }
    "validate" { npm run validate }
    "cdk:deploy" { npm run cdk:deploy }
    "cdk:synth" { npm run cdk:synth }
    "cdk:destroy" { npm run cdk:destroy }
    default { 
        Write-Host "Running: npm $Command"
        npm $Command 
    }
}
