# VxBase时序数据库

**版本**: 3.0.0  
**OpenAPI**: 3.0.0

---
# basePath：/os/open-api/

## Realtime

### POST /realtime/v3/read

**批量读当前值**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| objects | array<object> | 用于指定需要查询的「数据对象」及「待返回的属性」，数组中每个元素代表一组查询对象。 结构规则： 1. 数组元素：每个元素是一个 Object，键名为「accessId」（数据对象的唯一标识），键值为「属性数组」（指定该对象需返回的属性）。 2. accessId 含义（数据对象标识）：
  - 位号数据：accessId = 位号别名（如 "temp_sensor_1"）；
  - UNS 文件：accessId = 文件路径（如 "data/device_01.uns"）；
  - 结构化对象属性：accessId = 「对象路径.属性名」（如 "temp_sensor_1.current_value"）；
3. 属性数组规则（指定需返回的属性）：
  - 空数组 []：返回该 accessId 对应的「所有属性」；
  - ["*"]：效果同空数组，返回所有属性；
  - 具体属性名（如 ["power", "electric"]）：仅返回指定的属性； |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| datas | array<NamedValueItem> |  |
| datas[].name | string | 名称标识 |
| datas[].value | ValueItem |  |
| datas[].value.timeStamp | number | 时间戳 |
| datas[].value.status | number | 质量码 |
| datas[].value.value | object | 可选的附加值（任意类型） |

---

### POST /realtime/v3/write

**批量写值**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| datas | array<NamedValueItem> |  |
| datas[].name | string | 名称标识 |
| datas[].value | ValueItem |  |
| datas[].value.timeStamp | number | 时间戳 |
| datas[].value.status | number | 质量码 |
| datas[].value.value | object | 可选的附加值（任意类型） |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| objects | array<object> | 用于返回查询的「数据对象」及「待返回的属性」的结果，数组中每个元素代表一组查询失败的对象。 |
| objects[].name | Name | 设备位号别名、设备位号路径、文件别名、文件路径或文件的某个属性 |
| objects[].code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |

---


## History

### POST /history/v3/aggregation

**聚合查询**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| timeOffset | number | 时间窗口偏移，单位是微秒。比如，查询开始时间2025-08-01T00:00:00Z，统计间隔为10分钟，在没有指定时间偏移时，统计周期依次为["2025-08-01T00:00:00Z", "2025-08-01T00:10:00Z")，["2025-08-01T00:10:00Z", "2025-08-01T00:20:00Z")... 如指定时间偏移1分钟（60000000），则统计周期依次["2025-08-01T00:01:00Z", "2025-08-01T00:11:00Z")，["2025-08-01T00:11:00Z", "2025-08-01T00:21:00Z") ... 需要注意，统计的结束时间是不会偏移的，这一般意味着最后一个区间的时间会少于之前的区间。 |
| queryTimes | array<string> | 查询的起止时间段，采用ISO8601标准的字符串，比如"2025-08-25T10:00:00Z"或者"2025-08-25T18:00:00+08:00"。当前不支持指定时间边界是否含，总是默认前闭后开。 |
| objects | array<object> | 用于指定需要查询的「数据对象」及「待返回的属性」，数组中每个元素代表一组查询对象。 结构规则： 1. 数组元素：每个元素是一个 Object，键名为「accessId」（数据对象的唯一标识），键值为「属性数组」（指定该对象需返回的属性）。 2. accessId 含义（数据对象标识）：
  - 位号数据：accessId = 位号别名（如 "temp_sensor_1"）；
  - UNS 文件：accessId = 文件路径（如 "data/device_01.uns"）；
  - 结构化对象属性：accessId = 「对象路径.属性名」（如 "temp_sensor_1.current_value"）；
3. 属性数组规则（指定需返回的属性）：
  - 空数组 []：返回该 accessId 对应的「所有属性」；
  - ["*"]：效果同空数组，返回所有属性；
  - 具体属性名（如 ["power", "electric"]）：仅返回指定的属性； |
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| reverse | Reverse | 用于查询结果按时间戳的排序：0(默认值) - 按时间戳升序；1 - 按时间戳降序 |
| interpolation | Interpolation | 插值策略:0(默认值) - 前值; 2 - 线性插值 |
| interval | Interval | 采样/统计间隔，时间精度是微秒 |
| badStrategy | object | 对于bad数据的处理策略。1 - 过滤bad点; 2 - 使用前一个好值; 3 - 当前区间计算终止，结果为bad |
| method | array<string> | 聚合的方法，数组，支持指定多个，如["first", "max"],first：区间第一个值;max：区间内最大值 |
| dataCount | DataCount | 期望获得结果的数量。一次请求中，最多支持10万数据。批量查询时，则平均至单个位号或文件属性。 |
| timeOut | TimeOut | 请求超时时间, 请求超时时间, 默认是微秒 |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas | array<object> |  |
| datas[].name | Name | 设备位号别名、设备位号路径、文件别名、文件路径或文件的某个属性 |
| datas[].code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas[].resultType | ResultType | 当前结果对应的聚合方法(仅聚合) |
| datas[].values | array<NamedValuesItem> |  |
| datas[].values[].name | string | 名称标识 |
| datas[].values[].values | array<ValueItem> |  |
| datas[].values[].values[].timeStamp | number | 时间戳 |
| datas[].values[].values[].status | number | 质量码 |
| datas[].values[].values[].value | object | 可选的附加值（任意类型） |

---

### POST /history/v3/sample

**采样值查询**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| queryTimes | array<string> | 查询的起止时间段，采用ISO8601标准的字符串，比如"2025-08-25T10:00:00Z"或者"2025-08-25T18:00:00+08:00"。 采样查询是包含边界的，即前闭后闭。 有两类方式: 1. 两个时间，即开始时间和结束时间，根据采样间隔计算采样点。这里时间了可以相同，表示对某一时刻的采样，dataCount指定为1. 2. 两个以上的时间，这意味着指定了需要采样的时间点，此时无需在指定interval、datacount了。 |
| objects | array<object> | 用于指定需要查询的「数据对象」及「待返回的属性」，数组中每个元素代表一组查询对象。 结构规则： 1. 数组元素：每个元素是一个 Object，键名为「accessId」（数据对象的唯一标识），键值为「属性数组」（指定该对象需返回的属性）。 2. accessId 含义（数据对象标识）：
  - 位号数据：accessId = 位号别名（如 "temp_sensor_1"）；
  - UNS 文件：accessId = 文件路径（如 "data/device_01.uns"）；
  - 结构化对象属性：accessId = 「对象路径.属性名」（如 "temp_sensor_1.current_value"）；
3. 属性数组规则（指定需返回的属性）：
  - 空数组 []：返回该 accessId 对应的「所有属性」；
  - ["*"]：效果同空数组，返回所有属性；
  - 具体属性名（如 ["power", "electric"]）：仅返回指定的属性； |
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| interval | Interval | 采样/统计间隔，时间精度是微秒 |
| reverse | Reverse | 用于查询结果按时间戳的排序：0(默认值) - 按时间戳升序；1 - 按时间戳降序 |
| interpolation | Interpolation | 插值策略:0(默认值) - 前值; 2 - 线性插值 |
| dataCount | DataCount | 期望获得结果的数量。一次请求中，最多支持10万数据。批量查询时，则平均至单个位号或文件属性。 |
| timeOut | TimeOut | 请求超时时间, 请求超时时间, 默认是微秒 |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas | array<object> |  |
| datas[].name | Name | 设备位号别名、设备位号路径、文件别名、文件路径或文件的某个属性 |
| datas[].code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas[].resultType | ResultType | 当前结果对应的聚合方法(仅聚合) |
| datas[].values | array<NamedValuesItem> |  |
| datas[].values[].name | string | 名称标识 |
| datas[].values[].values | array<ValueItem> |  |
| datas[].values[].values[].timeStamp | number | 时间戳 |
| datas[].values[].values[].status | number | 质量码 |
| datas[].values[].values[].value | object | 可选的附加值（任意类型） |

---

### POST /history/v3/raw

**原始值查询**

#### Parameters

| 名称 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|

#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| dataOffset | number | 结果偏移，一般用作翻页。比如在指定的查询时间段内有1000个数据，界面上每次展示50个，首页dataOffset=0，得到前50个，下一页时即指定dataOffset=50，其余条件仍一样，即可得到51~100，依次类推。这里分页的关键是整体条件不变，仅改变偏移。 |
| queryTimes | array<string> | 查询的起止时间段，采用ISO8601标准的字符串，比如"2025-08-25T10:00:00Z"或者"2025-08-25T18:00:00+08:00"。对于原始查询，其作用为前闭后闭。 |
| objects | array<object> | 用于指定需要查询的「数据对象」及「待返回的属性」，数组中每个元素代表一组查询对象。 结构规则： 1. 数组元素：每个元素是一个 Object，键名为「accessId」（数据对象的唯一标识），键值为「属性数组」（指定该对象需返回的属性）。 2. accessId 含义（数据对象标识）：
  - 位号数据：accessId = 位号别名（如 "temp_sensor_1"）；
  - UNS 文件：accessId = 文件路径（如 "data/device_01.uns"）；
  - 结构化对象属性：accessId = 「对象路径.属性名」（如 "temp_sensor_1.current_value"）；
3. 属性数组规则（指定需返回的属性）：
  - 空数组 []：返回该 accessId 对应的「所有属性」；
  - ["*"]：效果同空数组，返回所有属性；
  - 具体属性名（如 ["power", "electric"]）：仅返回指定的属性； |
| timestampPrecision | TimestampPrecision | 时间精度，此参数作用于本次请求或者响应中的数据时间戳，与其他时间参数如超时时间、采样间隔等无关。可选[s:秒， ms:毫秒， us:微秒]，默认毫秒 |
| repeatedTimestampStrategy | number (0, 1, 2) | 原始数据时间戳重复时的策略：0（默认值）- 返回最后一个。 1 - 返回第一个 2 - 都返回 |
| reverse | Reverse | 用于查询结果按时间戳的排序：0(默认值) - 按时间戳升序；1 - 按时间戳降序 |
| dataSource | number (0, 1) | 在系统运行过程中，除数据源外，采集服务、实时数据服务、存档服务都可能会产生数据，实时数据服务、存档数据在检测到数据源断开和系统退出时会自动存储一个bad点。查询方法提供了数据来源进行过滤的功能：0（默认值）- 所有数据。 1 - 仅数据源数据 |
| valueStrategy | number (0, 1) | 结果中v的策略：该参数仅对lblob类型生效：0（默认值）- 返回vqst。 1 - 返回qst |
| dataCount | DataCount | 期望获得结果的数量。一次请求中，最多支持10万数据。批量查询时，则平均至单个位号或文件属性。 |
| timeOut | TimeOut | 请求超时时间, 请求超时时间, 默认是微秒 |
#### Responses

**200**: 

| 字段 | 类型 | 说明 |
|------|------|------|
| message | Message | 请求结果code的文本描述，可用于显示或问题定位 |
| code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas | array<object> |  |
| datas[].name | Name | 设备位号别名、设备位号路径、文件别名、文件路径或文件的某个属性 |
| datas[].code | Code | 0 表示成功，非0 表示失败。成功时不需要判断objects中的内容，如果失败，objects中有所有失败的信息。如果失败，但是objects为空，说明全部失败（请求异常场景）。 |
| datas[].resultType | ResultType | 当前结果对应的聚合方法(仅聚合) |
| datas[].values | array<NamedValuesItem> |  |
| datas[].values[].name | string | 名称标识 |
| datas[].values[].values | array<ValueItem> |  |
| datas[].values[].values[].timeStamp | number | 时间戳 |
| datas[].values[].values[].status | number | 质量码 |
| datas[].values[].values[].value | object | 可选的附加值（任意类型） |

---


## Config

### PUT /tsdb/v3/config/devices

**修改设备**

修改设备


#### Request Body

| 字段 | 类型 | 说明 |
|------|------|------|
| fields | array<string> | 设备的修改字段。空则修改所有字段
  * displayName                 - 设备的显示名称
  * description                 - 描述
  * owner                       - 设备责任人
  * companyAddress              - 公司地址
  * companyName                 - 公司名字
  * type                        - 设备类型
  * source                      - 设备来源
  * timestampType               - 设备时间戳类型
  * state                       - 设备状态
  * encrypt                     - 是否加密
  * ip                          - ip
  * port                        - 端口
  * fullSync                    - 全量同步
  * offlineTimeout              - 设备无数据超时离线时间
  * storageResource             - 存储资源
  * redundant                   - 是否冗余
  * deviceGroup                 - 设备分组的alias
  * deviceVersion               - 设备版本
 |
| devices | array<DeviceDetail> |  |
| devices[].uuid | string | 设备的uuid，全局唯一 |
| devices[].alias | string | 设备名称，唯一标识，不可重复 |
| devices[].displayName | string | 设备的显示名称 |
| devices[].description | string | 设备描述 |
| devices[].owner | string | 设备责任人 |
| devices[].companyAddress | string | 公司地址 |
| devices[].companyName | string | 公司名字 |
| devices[].type | string (supCollector, StdDataService, GRPC, IoT, Node-Red, AECollector, simuCollector, videoCollector, NeuroLink) | 按设备类型查询设备，仅支持单类型。
设备类型, 与返回的type字段一致：
  * supCollector    -- 时序数据采集器
  * StdDataService  -- 时序库连接器
  * GRPC            -- GRPC网关
  * IoT             -- IOT网关，接入MQTT
  * AECollector     -- 报警采集器
  * simuCollector   -- 模拟采集器
  * videoCollector  -- 视频采集器
  * Node-Red        -- Node-Red接入
  * NeuroLink       -- NeuroLink设备
 |
| devices[].source | string (inside, outside) | 设备来源，仅对Node-Red生效。
  * inside    -- 内置
  * outside   -- 外置
 |
| devices[].timestampType | string (server, collector) | 设备时间戳类型： 
 * server    -- 服务器时间戳
 * collector -- 设备时间戳
 |
| devices[].state | string (online, offline, needAccess, needReplace) | description: |
  设备状态 
    * online      -- 在线
    * offline     -- 离线
    * needAccess  -- 待接入
    * needReplace -- 待替换
 |
| devices[].encrypt | boolean | 是否加密。TSDCollector和AECollector可用 |
| devices[].secretKey | string | 私钥。 |
| devices[].publicKey | string | 公钥。 |
| devices[].ip | string | 设备的ip地址。 |
| devices[].port | string | 设备端口 |
| devices[].fullSync | boolean | 全量同步，StdDataService可用 |
| devices[].offlineTimeout | integer (int32) | 设备无数据超时离线时间，IOT可用。单位为毫秒 |
| devices[].offlineTimeoutUnit | string | 设备超时离线时间单位，IOT可用。 |
| devices[].storageResource | string | 存储资源，AECollector可用 |
| devices[].redundant | boolean | 是否冗余 |
| devices[].deviceGroup | string | 设备分组的alias。 |
| devices[].deviceVersion | string | 设备版本。 |
| devices[].redundantInfo | array<object> | 冗余信息 |
| devices[].redundantInfo[].ip | string | 冗余信息ip |
| devices[].redundantInfo[].port | string | 端口 |
| devices[].redundantInfo[].state | string (online, offline, ready) | 运行状态：
* online    - 在线
* offline   - 离线
* ready     - 备用
 |
| devices[].redundantInfo[].version | string | 采集器的组态版本 |
| devices[].tagCount | integer (int32) | 位号数量 |
| devices[].endpointId | string | 已接入的endpoint |
| devices[].mountPath | string | 自动挂载的uns父级文件夹别名，适用于NeuroLink设备 |
| devices[].version | VersionInfo | 版本信息 |
| devices[].version.versionId | integer (int32) | 版本ID，最新的变化版本 |
| devices[].version.versionUuid | string | 版本的UUID，版本的唯一标识 |
| devices[].version.modifyTime | integer (int64) | 修改时间，服务器基准的utc时间，单位为秒 |
| devices[].version.createVersion | integer (int32) | 创建版本ID |
| devices[].version.createTime | integer (int64) | 创建时间，服务器基准的utc时间，单位为秒 |
#### Responses

**200**: OK


**400**: tsdb通用内部错误

| 字段 | 类型 | 说明 |
|------|------|------|
| code | integer (uint32) | 业务的错误码
  * 0x00000000 -- 成功
  * 0x00300000 -- 写值专用，用于表示下写的值已经被接受，但被钳制	
  * 0x002d0000 -- 订阅已经被转移，用于服务器切换时，订阅客户端向外发起通知
  * 0x002e0000 -- 操作结果将会异步完成。异步写值时将返回这个结果
  * 0x00b20000 -- 表示成功，但等待最终的结果，用于中间结果的通知
  * 0x00ba0000 -- 已经成功，但本次结果是不完整的
  * 0x00a50000 -- 没有数据
  * 0x00a60000 -- 还有数据
  * 0x80000000 -- 通用错误码，无扩展含义，不建议使用
  * 0x80010000 -- 未预期的错误，不建议使用
  * 0x80020000 -- 内部错误，需要扩展使用,使用时附加模块号
  * 0x80030000 -- 内存不足
  * 0x80050000 -- 通信故障
  * 0x80060000 -- 编码错误
  * 0x80070000 -- 解码错误，客户端解码错误或服务端对接收到的消息进行解码发生错误后，可用此错误码返回	
  * 0x800a0000 -- 超时，客户端等待服务器反馈超时时使用
  * 0x800b0000 -- 服务器不支持客户端所请求的服务
  * 0x800d0000 -- 未连接到服务器，客户端在未连接到服务器时，应用调用了其他访问数据的接口时，使用此错误码返回
  * 0x80110000 -- 未知的数据类型
  * 0x80230000 -- 服务器接收到客户端请求的时间标签错误
  * 0x80250000 -- 非法的客户端id，当调用接口时，检测到传入的clientid非法时返回
  * 0x80270000 -- 客户端未登录，当调用接口时，客户端dll发现未登录到服务器时返回
  * 0x80260000 -- 客户端已登出，当调用接口时，客户端dll发现已经从服务器登出时返回此错误码
  * 0x80340000 -- 未知位号，即位号不存在
  * 0x803a0000 -- 位号不可读
  * 0x803b0000 -- 位号只读，不支持写操作
  * 0x803c0000 -- 值越界，超出了量程范围，目前用于写值时超量程时返回错误
  * 0x803d0000 -- 不支持，对某项功能不支持，服务器端建议使用BS_Error_ServiceUnsupported
  * 0x803e0000 -- 未找到，当查询位号未找到或订阅分组未找到时，返回此错误	
  * 0x80400000 -- 未实现，更多的建议在接口层面使用，某些接口在sdk中未实现	
  * 0x805a0000 -- 请求已经被客户端取消，如查询中，中断查询时返回此错误码
  * 0x80740000 -- 类型错误，用于写值时接受到数据类型与位号组态的数据类型不匹配
  * 0x807d0000 -- 服务器过于忙碌，当请求超过服务器限值时返回此错误码
  * 0x80890000 -- 组态错误，导致无法操作
  * 0x808d0000 -- 不提供服务，用于位号无授权时返回
  * 0x809b0000 -- 没有数据
  * 0x80ab0000 -- 参数错误，属于参数类的通用错误，查询或订阅中有定义更详细的错误，只有未找到更详细的错误码时使用此错误码
  * 0x80ad0000 -- 已经与服务器断开连接
  * 0x80b20000 -- 等待结果返回
  * 0x80b50000 -- 操作未结束，被堵塞	
  * 0x80b70000 -- 连接数已经达到系统支持的最大数
  * 0x80b80000 -- 请求过大，服务端接收到请求之后判断出需要申请的内存过大时，可以使用此错误码返回
  * 0x80b90000 -- 客户端接收到服务端反馈，判断出需要申请的内存过大时，可以使用此错误码返回
  * 0x80be0000 -- 协议版本不知道，当客户端和服务器协议版本不匹配时返回此错误码
  * 0x80020001 -- 服务已连接	
  * 0x80020002 -- 已经存在
  * 0x80db0000 -- 客户端订阅位号数量超过了最大限制
  * 0x80770000 -- 所有的客户端累加的订阅总量超过了系统限制
  * 0x80280000 -- 未找到订阅分组
  * 0x80410000 -- 订阅模式错误
  * 0x80420000 -- 订阅位号不存在
  * 0x80430000 -- 订阅过滤参数错误，用于订阅死区参数
  * 0x80020101 -- 订阅分组已存在
  * 0x80020102 -- 设备离线
  * 0x80020103 -- 位号已存在
  * 0x80020104 -- 设备不存在
  * 0x80d50000 -- 指定的聚合（统计）查询方法不支持
  * 0x806e0000 -- 查询使用过多的服务器资源，用于查询跨度过大
  * 0x80720000 -- 查询的方法不支持
  * 0x803e0201 -- 未找到对应的服务实例
  * 0x80ad0200 -- 与StorageServer断开连接(失去了组态源)
  * 0x80020200 -- 内部错误，转发错误
  * 0x80ab0200 -- 非法参数
  * 0x807d0200 -- 服务器过于忙碌，大于7天的支持16个位号并发，其他的支持1000个并发
  * 0x80b80200 -- 请求过大，原始值查询最大跨度7天，其他查询模式查询跨度3年，每个位号的最大数据条数是100000条
  * 0x00a50201 -- sql数据取完
  * 0x00a50202 -- sql数据列数据取完
  * 0x803e0202 -- 未找到handler对应的sql
  * 0x803e0203 -- 未找到sql中的结果列
  * 0x803e0204 -- 未找到sql中的时间条件
  * 0x803d0201 -- 不支持的sql结果列
  * 0x803d0202 -- 不支持的sql函数
  * 0x803d0203 -- 不支持的sql函数参数
  * 0x803d0204 -- 不支持的sql的LIMIT的OFFSET参数
  * 0x803d0205 -- 不支持的sql的语法
  * 0x80ab0201 -- sql非法的LIMIT参数
  * 0x80ab0202 -- sql非法的GROUP参数
  * 0x80ab0203 -- sql非法的条件参数
  * 0x80ab0204 -- sql非法的IN条件参数
  * 0x80ab0205 -- sql非法的时间参数
  * 0x80ab0206 -- sql非法的时间格式参数
  * 0x809b0201 -- sql无数据
  * 0x809b0202 -- sql未知的数据错误
  * 0x800a0201 -- sql查询超时
  * 0x80000201 -- sql查询接口错误
  * 0x80027003 -- TOKEN无效 //与SMT Token失效错误码保持一致 用于token失效后 跳至登录界面
  * 0x80020351 -- 用户名无效（用户名@租户）0x80020351
  * 0x80020352 -- 用户不存在0x80020352
  * 0x80020353 -- 密码无效
  * 0x80020354 -- token设置出错
  * 0x80020355 -- Token失效(同0x80027003)
  * 0x80020356 -- 权限无效0x80020356
  * 0x80020357 -- 格式错误0x80020357
  * 0x80020358 -- 冗余错误0x80020358
  * 0x80020359 -- 反序列化错误0x80020359
  * 0x8002035a -- 序列化错误0x8002035a
  * 0x8002035b -- 组态重名错误0x8002035b
  * 0x8002035c -- 服务意外退出0x8002035c
  * 0x8002035d -- Redis连接错误0x8002035d
  * 0x8002035e -- 组态订阅失败0x8002035e
  * 0x8002035f -- 拒绝删除关联组态对象0x8002035f
  * 0x80020360 -- 组态导入文件无效0x80020360
  * 0x80020361 -- 组态导入文件格式错误
  * 0x80020362 -- 组态导入列数不匹配
  * 0x80020363 -- 组态导入列转换失败
  * 0x80020364 -- 组态导入列缺失
  * 0x80020365 -- 节点部署失败0x80020365
  * 0x80020366 -- 组态文件错误
  * 0x80020367 -- 组态备份失败,0x80020367
  * 0x80020368 -- 组态还原失败
  * 0x80020369 -- 组态正忙
  * 0x8002036a -- 位号重名，0x8002036a
  * 0x8002036b -- 设备重名
  * 0x8002036c -- 分组重名
  * 0x8002036d -- 节点重名
  * 0x8002036e -- 用户重名
  * 0x8002036f -- 角色重名，0x8002036f
  * 0x80020370 -- 白名单重名，0x80020370
  * 0x80020371 -- 单位重名
  * 0x80020372 -- 设备分组重名
  * 0x80020373 -- 设备编码重复
  * 0x80020374 -- 设备IP重复
  * 0x80020375 -- 设备数据源重复，0x80020375
  * 0x80020376 -- 组态对象不存在，0x80020376
  * 0x80020377 -- 位号不存在，0x80020377
  * 0x80020378 -- 设备不存在
  * 0x80020379 -- 逻辑分组不存在
  * 0x8002037a -- 节点不存在
  * 0x8002037b -- 用户不存在
  * 0x8002037c -- 角色不存在
  * 0x8002037d -- 白名单不存在
  * 0x8002037e -- 单位不存在
  * 0x8002037f -- 设备分组不存在 0x8002037f
  * 0x80020380 -- 位号别名重名，0x80020380
  * 0x80020381 -- ID缺失	0x80020381		
  * 0x80020382 -- Name缺失		
  * 0x80020383 -- Type缺失		
  * 0x80020384 -- io_addr缺失	
  * 0x80020385 -- 量程参数缺失
  * 0x80020386 -- 量程参数错误
  * 0x80020387 -- 白名单用户缺失
  * 0x80020388 -- 白名单IP缺失
  * 0x80020389 -- 设备名称缺失
  * 0x8002038a -- IP_ADDR缺失,0x8002038a
  * 0x8002038b -- IP_ADDR格式错误,0x8002038b
  * 0x8002038c -- 原密码错误,0x8002038c
  * 0x8002038d -- 节点不可用, 0x8002038d
  * 0x8002038e -- 节点正在同步, 0x8002038e
  * 0x8002038f -- 节点离线, 0x8002038f
  * 0x80020390 -- 无可用节点, 0x80020390
  * 0x80020391 -- 冗余节点离线, 0x80020391
  * 0x80020392 -- 无主节点, 0x80020392
  * 0x80020393 -- 同步数据出错, 0x80020393
  * 0x80020394 -- 返回数据出错, 0x80020394
  * 0x80020395 -- 无需发布, 0x80020395，maybe chaged to 0x40020395
  * 0x80020396 -- 对设备操作失败, 0x80020396
  * 0x80020397 -- 对设备发布失败, 0x80020397
  * 0x80020398 -- 获取设备信息失败, 0x80020398
  * 0x80020399 -- 设备驱动信息无效, 0x80020399
  * 0x8002039a -- 位号ID重复，0x8002039A
  * 0x8002039b -- 位号名与别名重名，0x8002039B
  * 0x8002039c -- 异常处理方式格式错误，0x8002039C
  * 0x8002039d -- 数据库主键重复
  * 0x8002039e -- 数据库唯一键重复
  * 0x8002039f -- 组态无授权
  * 0x800203a0 -- 无需同步
  * 0x800203a1 -- 同步待续，同步过程中控流使用
  * 0x800203a2 -- 同步过程中组态发生变化，需停止同步后重新同步
  * 0x800203a3 -- 同步过程中客户端处理返回超时
  * 0x800203a4 -- 拒绝重载
  * 0x800203a5 -- 设备已鉴权，不允许删除
  * 0x800203a6 -- 设备校验失败， 不能增加
  * 0x800203a7 -- 设备开启自动同步，不允许手动同步
  * 0x800203b0 -- uuid 无效
  * 0x800203b1 -- uuid 重复
  * 0x400203b0 -- 待审核
  * 0x400203b1 -- 已拒绝
  * 0x400203b2 -- 待替换
 |
| message | string | 消息 |

---

