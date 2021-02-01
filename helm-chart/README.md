# Important helm commands.

Please run these commands from `root`

### Lint chart

```
helm lint ./helm-chart/public/fyipe 
```

### Install as an Enterprise Cluster with default values
```
helm install fi ./helm-chart/public/fyipe --namespace default
```

### Install on staging
```
helm install -f ./kubernetes/values-saas-staging.yaml fi ./helm-chart/public/fyipe --namespace default
```

### Install on production
```
helm install -f ./kubernetes/values-saas-production.yaml fi ./helm-chart/public/fyipe --namespace default 
```

### Update Cluster

Staging: 

```
sudo kubectl delete job fi-init-script
sudo helm upgrade --reuse-values -f ./kubernetes/values-saas-staging.yaml fi ./helm-chart/public/fyipe
```

Production: 

```
sudo kubectl delete job fi-init-script
sudo helm upgrade --reuse-values -f ./kubernetes/values-saas-production.yaml fi ./helm-chart/public/fyipe
```

If you introduce values, you can set 

```
helm upgrade --reuse-values --set key=value fi ./helm-chart/public/fyipe
```

### Uninstall
```
helm uninstall fi --namespace=default
```

### Docker build and push to docker repo with `:test` tag

Build and deploy all (with master tag, you can use any other tag): 

```
chmod +x ./ci/scripts/docker-build-all.sh 
sudo ./ci/scripts/docker-build-all.sh latest
```

Build and deploy one: 

```
chmod +x ./ci/scripts/docker-build.sh
sudo ./ci/scripts/docker-build.sh $repo $tag
```

### Package and deploy helm chart
```
cd ./helm-chart/public
helm repo index ./fyipe
helm package ./fyipe
helm repo index .
cd ..
cd ..
```

### Docker Images
Docker Images are hosted at: https://hub.docker.com/orgs/fyipeproject/repositories and are public.

### More info
Read readme at [./public/fyipe/Readme.md](./public/fyipe/Readme.md)
