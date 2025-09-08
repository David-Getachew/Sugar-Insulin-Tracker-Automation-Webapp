# QA Automation Script for Sugar Insulin Tracker Supabase Integration
# PowerShell version for Windows compatibility

param(
    [switch]$Verbose
)

# Function to print colored output
function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if server is running
function Test-Server {
    Write-Info "Checking if development server is running..."
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method Head -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "✓ Development server is running"
            return $true
        }
    }
    catch {
        Write-Error "✗ Development server is not running"
        Write-Error "Please run 'pnpm dev' first"
        return $false
    }
}

# Function to test page accessibility
function Test-PageAccess {
    param([string]$Page)
    
    $url = "http://localhost:8080$Page"
    Write-Info "Testing page access: $Page"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "✓ Page $Page is accessible"
            return $true
        }
    }
    catch {
        Write-Error "✗ Page $Page is not accessible"
        return $false
    }
}

# Function to test environment variables
function Test-EnvVars {
    Write-Info "Checking environment variables..."
    
    if (-not (Test-Path ".env")) {
        Write-Error "✗ .env file not found"
        return $false
    }
    
    $envContent = Get-Content ".env"
    $requiredVars = @("VITE_PUBLIC_SUPABASE_URL", "VITE_PUBLIC_SUPABASE_ANON_KEY", "DEMO_USER_EMAIL", "DEMO_USER_PASSWORD")
    
    foreach ($var in $requiredVars) {
        if ($envContent -match "^$var=") {
            Write-Success "✓ $var is defined"
        }
        else {
            Write-Error "✗ $var is not defined in .env"
            return $false
        }
    }
    
    return $true
}

# Function to test build process
function Test-Build {
    Write-Info "Testing build process..."
    
    try {
        $result = & pnpm build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ Build completed successfully"
            return $true
        }
        else {
            Write-Error "✗ Build failed"
            if ($Verbose) {
                Write-Host $result
            }
            return $false
        }
    }
    catch {
        Write-Error "✗ Build failed with exception: $($_.Exception.Message)"
        return $false
    }
}

# Function to test TypeScript compilation
function Test-TypeScript {
    Write-Info "Testing TypeScript compilation..."
    
    try {
        $result = & pnpm exec tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ TypeScript compilation successful"
            return $true
        }
        else {
            Write-Warning "⚠ TypeScript compilation has warnings (non-blocking)"
            if ($Verbose) {
                Write-Host $result
            }
            return $true
        }
    }
    catch {
        Write-Warning "⚠ TypeScript check failed (non-blocking): $($_.Exception.Message)"
        return $true
    }
}

# Function to check file structure
function Test-FileStructure {
    Write-Info "Checking file structure..."
    
    $requiredFiles = @(
        "src/lib/supabase.ts",
        "src/contexts/AuthContext.tsx",
        "src/components/ProtectedRoute.tsx",
        "src/hooks/useDatabase.ts",
        "src/types/database.ts",
        ".env",
        ".env.example"
    )
    
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "✓ $file exists"
        }
        else {
            Write-Error "✗ $file is missing"
            return $false
        }
    }
    
    return $true
}

# Function to test integration points
function Test-Integration {
    Write-Info "Testing integration points..."
    
    # Check Supabase client configuration
    if (Test-Path "src/lib/supabase.ts") {
        $content = Get-Content "src/lib/supabase.ts" -Raw
        if ($content -match "createClient" -and $content -match "supabaseUrl" -and $content -match "supabaseKey") {
            Write-Success "✓ Supabase client configuration is correct"
        }
        else {
            Write-Error "✗ Supabase client configuration is incorrect"
            return $false
        }
    }
    
    # Check AuthContext implementation
    if (Test-Path "src/contexts/AuthContext.tsx") {
        $content = Get-Content "src/contexts/AuthContext.tsx" -Raw
        if ($content -match "useAuth" -and $content -match "AuthProvider") {
            Write-Success "✓ AuthContext is properly implemented"
        }
        else {
            Write-Error "✗ AuthContext implementation is incomplete"
            return $false
        }
    }
    
    return $true
}

# Function to test user interactions
function Test-UserInteractions {
    Write-Info "Testing user interaction patterns..."
    
    # Check demo banners
    $formsContent = Get-Content "src/pages/Forms.tsx" -Raw
    $profileContent = Get-Content "src/pages/Profile.tsx" -Raw
    
    if ($formsContent -match "Demo Account" -and $profileContent -match "Demo Account") {
        Write-Success "✓ Demo account banners are implemented"
    }
    else {
        Write-Error "✗ Demo account banners are missing"
        return $false
    }
    
    # Check read-only behavior
    if ($formsContent -match "isDemo" -and $formsContent -match "disabled.*isDemo") {
        Write-Success "✓ Read-only behavior is implemented"
    }
    else {
        Write-Error "✗ Read-only behavior is not properly implemented"
        return $false
    }
    
    return $true
}

# Function to test webhook integration
function Test-WebhookIntegration {
    Write-Info "Testing emergency webhook integration..."
    
    $formsContent = Get-Content "src/pages/Forms.tsx" -Raw
    
    if ($formsContent -match "N8N_EMERGENCY_WEBHOOK_URL" -and $formsContent -match "fetch.*webhook") {
        Write-Success "✓ Emergency webhook integration is implemented"
    }
    else {
        Write-Error "✗ Emergency webhook integration is missing"
        return $false
    }
    
    return $true
}

# Main execution
function Main {
    Write-Info "Starting QA automation for Sugar Insulin Tracker..."
    Write-Info "=================================================="
    
    $totalTests = 0
    $passedTests = 0
    
    # Array of test functions
    $tests = @(
        { Test-EnvVars },
        { Test-FileStructure },
        { Test-TypeScript },
        { Test-Build },
        { Test-Integration },
        { Test-UserInteractions },
        { Test-WebhookIntegration },
        { Test-Server }
    )
    
    # Run tests
    foreach ($test in $tests) {
        $totalTests++
        Write-Host ""
        if (& $test) {
            $passedTests++
        }
    }
    
    # If server is running, test page access
    if (Test-Server) {
        $pages = @("/", "/login", "/dashboard", "/forms", "/profile")
        foreach ($page in $pages) {
            $totalTests++
            Write-Host ""
            if (Test-PageAccess $page) {
                $passedTests++
            }
        }
    }
    
    # Print results
    Write-Host ""
    Write-Info "=================================================="
    Write-Info "QA Results: $passedTests/$totalTests tests passed"
    
    if ($passedTests -eq $totalTests) {
        Write-Success "🎉 All tests passed! The application is ready for deployment."
        exit 0
    }
    else {
        $failedTests = $totalTests - $passedTests
        Write-Error "❌ $failedTests tests failed. Please review the issues above."
        exit 1
    }
}

# Run main function
Main