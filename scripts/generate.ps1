$env:TRIPO_CLIENT_APP='codex'
$env:TRIPO_DISTRIBUTION_CHANNEL='codex_plugin'
$env:HTTPS_PROXY='http://127.0.0.1:10808'
$env:HTTP_PROXY=$env:HTTPS_PROXY
$env:NODE_USE_ENV_PROXY='1'
$items=Get-Content assets/catalog.json -Raw | ConvertFrom-Json
foreach($item in $items.PSObject.Properties){
 $prompt=$item.Value+', cozy pastel hand painted game miniature, warm cream jade coral palette, clean readable silhouette, standalone isolated asset, no people no text no surrounding street'
 & tripo make $prompt -p face_limit=18000 -p texture_quality=detailed --name $item.Name -o ./assets --json --yes 1> ('assets/'+$item.Name+'.result.json') 2> ('assets/'+$item.Name+'.log')
 if($LASTEXITCODE -ne 0){break}
}
