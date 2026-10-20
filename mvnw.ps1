Push-Location "$PSScriptRoot\backend"
try {
    & .\mvnw.cmd @args
} finally {
    Pop-Location
}
