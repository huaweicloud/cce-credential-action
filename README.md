# cce-credential-action
Cloud Container Engine (CCE) provides highly scalable and high-performance enterprise-class Kubernetes clusters that can run Docker containers. With CCE, you can easily deploy, manage, and scale containerized applications on HUAWEI CLOUD.

This action checks whether kubectl is installed in the current environment. If kubectl is not installed, the latest stable kubectl is installed and obtains the credentials of the CCE cluster created on CCE based on the AK/SK, project ID, and cluster information. Configured in the current environment to provide authentication for subsequent operations such as cluster deployment, update, and deletion.

## **Pre-work**
(1).Create a CCE cluster. For details, see the CCE documentation.:https://support.huaweicloud.com/cce/index.html  
(2).Obtain the AK/SK and project_id of the HUAWEI CLOUD user. For details, see. https://support.huaweicloud.com/apm_faq/apm_03_0001.html  
(3).Obtain the cluster ID of the CCE cluster. To obtain the ID, click the CCE cluster to go to the CCE details page and copy the cluster ID in the upper left corner.
(4).To access the HUAWEI CLOUD CCE cluster from GitHub, you need to create and bind an EIP to the cluster.

## **Parameter description:**
ak:Huawei access key (AK), which is mandatory.
sk:access key (SK), which is mandatory. 
region:specifies the region where the current CCE cluster is located, for example, cn-north-4. This parameter is mandatory. 
project_id: specifies the project ID of the region to which the current user belongs. This parameter is mandatory.
cluster_id: specifies the ID of the CCE cluster. This parameter is mandatory.

## **Example**
Example: Run the cce-credential-action@v1.0.0 command to obtain the kubeconfig of the CCE cluster and use the kubeconfig to perform operations on the CCE cluster.
```yaml
- name: get CCE Cluster Credentials
  uses: huaweicloud/cce-credential-action@v1.0.0
  with:
     ak: ${{ secrets.ACCESSKEY }}
     sk: ${{ secrets.SECRETACCESSKEY }}
     region: "af-south-1"
     project_id: "xxxxxxxxxxxxxxxxxxxxxxx"
     cluster_id: "xxxxxxxxxxxxxxxxxxxxxxx"

- name: get CCE Cluster info
      - run: |
          kubectl version --client
          kubectl cluster-info
```

## Public IP Addresses Used in Actions
- This action requires the CCE service, which invokes the open APIs of HUAWEI CLOUD. The involved public network domain names can be obtained from HUAWEI CLOUD.[Regions and Endpoints](https://developer.huaweicloud.com/endpoint?CCE) view
- This action requires downloading kubectl. You need to access https://storage.googleapis.com URL under the domain name 

## Public IP address introduced by the third-party open-source package
- https://docs.github.com/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary  
- https://iam.myhuaweicloud.com
- https://github.com/jprichardson/node-fs-extra/issues/269
- https://github.com/jprichardson/node-fs-extra/pull/141
- https://lodash.com/
- https://openjsf.org/
- https://lodash.com/license
- http://underscorejs.org/LICENSE
- https://npms.io/search?q=ponyfill
- http://momentjs.com/guides/#/warnings/js-date/
- http://momentjs.com/guides/#/warnings/min-max/
- http://momentjs.com/guides/#/warnings/add-inverted-param/
- http://momentjs.com/guides/#/warnings/zone/
- http://momentjs.com/guides/#/warnings/dst-shifted/
- https://repo.cloudartifact.lfg.dragon.tools.huawei.com/artifactory/api/npm/cbu-npm-public/axios/-/axios-0.21.4.tgz
- https://github.com/axios/axios/issues
