### API family 24h

* [Caracteristas gerais](#caracteristas-gerais)
    * [Endpoint](#endpoint)
* [Criação de usuário](#criação-de-usuário)
    * [sem facebook](#sem-facebook)
    * [com facebook](#com-facebook)
* [Envio de foto de perfil](#envio-de-foto-de-perfil)
    * [Restrições]()
        * [caso ok]()
        * [caso arquivo invalido]()
        * [caso tamanho inválido]()
* [Login de usuário]()
    * [com email+senha]()
        * [senha invalida]()
        * [senha ok]()
    * [com facebook]()
        * [com sucesso]()
        * [Caso o access_token seja invalido]()
        * [Caso o access_token foi expirado]()
* [Atualizar usuário]()
    * [sucesso]()
* [Logout]()
    * [sucesso]()
* [Reset de senha por e-mail]()
* [Criar grupos]()
* [Apagar grupo]()
* [Listar grupos deletados]()
* [Criar notificacoes \(sirene, wipe, etc\)]()
* [Listar usuarios de um invite]()
* [Apagar um invite \(tanto para admin quanto um usuario recusando a entrada\)]()
* [Sugestoes de grupos]()
* [Listar membros do grupo]()
* [setar um membro como admin]()
* [Remover um membro de admin]()
* [Remover membro do grupo \[aka: sair de grupo\]()
* [Enviar posicoes de um usuário (celular)]()
* [Criar notificacao]()
* [Listando todas, mais recentes vem antes]()
* [Marcar notificação como lida]()


#### Caracteristas gerais

* Envio das informações com url-encoded;
* Resposta padrão em JSON (sem formatação);
* Erros de formulário/ações, o response code=400
* Erros de permissoes ou api_key, code=403
    * {"error":"access denied"} para api key invalida/expirada.
    * {"error":"insufficient privileges"} para permissão negada.
* se RESPONSE->{error} == 'form_error', haverá uma outra chave (RESPONSE->{form_error}), com um HASH, cuja chaves são os nomes dos campos enviados, e o valor a descrição do erro. (geralmente, 'invalid' ou 'missing'.
    * Ex, erro ao cadastrar um usuário cujo e-mail já existe:
    * {"error":"form_error","form_error":{"email":"invalid"}} 


#### Endpoint
http://interno.b-datum.com:2020/

#### Criação de usuário
Enviar api_key=LAK2La6084ac4f20de47b82ba1K3hj3hH32KS301SA2 para cria a conta, caso contrario, você não terá permissão.
Enviar type=user
Enviar também o profile_picture_url 

##### sem facebook

Metodo: POST 
Endpoint: /users
Campos obrigatórios:
name
email
gender (male, female)
telephone (only digits, with country)
password
role=user
session:is_mobile=1
session:device_name=(modelo do celular)
profile_picture_url=http… (pegar URL do facebook, caso contrario, exibir um padrão no caso do campo vir vazio depois)
Campos opcionais
android_registrationid
com facebook

Metodo: POST 
Endpoint: /users
Campos obrigatórios:
name 
email
gender (male, female)
telephone (only digits, with country)
access_token
role=user
session:is_mobile=1
session:device_name=(modelo do celular)
profile_picture_url=
Campos opcionais:
password
android_registrationid

É recomendado utilizar o ?get_session=1 para retornar uma chave de API junto com a criação do usuário.

Quando get_session=1, vai ser necessário enviar os campos 
session:is_mobile=1
session:device_name=(modelo do celular)
Pois precisamos fazer o logout das outra session mobile quando o usuário fazer login em um segundo device.




**REQUEST:**
```
POST /users
Content-Length: 99
Content-Type: application/x-www-form-urlencoded
X-Api-Key: 71a3a0d7c1a7fe667cd92f96e796445ad2da347d

name=Foo+Bar&email=foo1%40email.com&password=foobarquux1&role=user&gender=F&telephone=5511912345678&get_session=1
```

**RESPONSE:**
```
201 Created
Location: http://localhost/users/29
Vary: Content-Type
Content-Length: 9
Content-Type: application/json
Charset: utf-8
Status: 201

{     
    "id":29, 
    "session": {
        "roles": [
            "user"
        ],
        "email": "....",
        "created_at": "2015-02-23T18:51:55",
        "name": "asdas asd as",
        "type": "user",
        "id": 29,
        "api_key": "7cd66280b22fb9dc211a8d1062460c9ff1203a2ad434",
        "has_password": "1"
    } 
}
```


#### Envio de foto de perfil

**Restrições**
Tamanho máximo da foto: **200000 bytes**
Tamanho máximo da altura ou largura: **180 px**
Formato recomendado: **JPEG**

Campos obrigatórios: 
`picture`

Campos opcionais: 
`set_as_current`

No caso mobile, é importante enviar com set_as_current=1, assim a foto do perfil do usuário é atualizada automaticamente.

#### caso ok

**REQUEST:**
```
POST http://localhost/users/309/profile-pictures?set_as_current=1
Content-Length: 1337
Content-Type: multipart/form-data; boundary=xYzZY
X-Api-Key: 4c3207099dd469f70c54d07af339051b0b7c370c

--xYzZY
Content-Disposition: form-data; name="picture"; filename="photo.png"
Content-Type: image/png

(....)

--xYzZY--
```

**RESPONSE:**
```
201 Created
Location: http://localhost/users/309/profile-pictures/103
Content-Type: application/json

{"id":103}
```

caso arquivo invalido:
```
{"error":"form_error","form_error":{"picture":"type parameter missing and it couldn't be determined from the file contents or file name"}}
```

caso tamanho inválido:
```
{"error":"form_error","form_error":{"picture":"file size limit - image width of 480 exceeds limit of 180"}}
```


#### Login de usuário

##### com email+senha

POST /login
Campos obrigatórios:
`email`
`password`
`android_registrationid`
`is_mobile=1`
`device_name=(modelo do celular)`

senha invalida:

**REQUEST:**
```
POST /login
Content-Length: 43
Content-Type: application/x-www-form-urlencoded

email=superadmin%40email.com&password=44444
```

**RESPONSE:**
```
400 Bad Request
Vary: Content-Type
Content-Length: 28
Content-Type: application/json
Charset: utf-8
Status: 400
X-Catalyst: 5.90082

{"error":"Login invalid(2)"}
```


##### senha ok:

**REQUEST:**
```
POST /login
Content-Length: 43
Content-Type: application/x-www-form-urlencoded

email=superadmin%40email.com&password=12345
```

**RESPONSE:**
```
HTTP/1.0 200 OK
Date: Mon, 23 Feb 2015 21:53:17 GMT
Server: HTTP::Server::PSGI
Vary: Content-Type
Content-Length: 346
Content-Type: application/json
Charset: utf-8
Client-Date: Mon, 23 Feb 2015 21:53:17 GMT
Client-Peer: 127.0.0.1:5000
Client-Response-Num: 1
X-Catalyst: 5.90083

{
    "roles": [
        "user"
    ],
    "email": "nueta1@email.com",
    "created_at": "2015-02-23T18:51:55",
    "name": "asdas asd as",
    "type": "user",
    "id": 54,
    "api_key": "7cd66280b22fb9dc211a8d1062460c9ff1203a2ad434",
    "has_password": "1"
}
```

##### com facebook
Este endpoint também pode ser utilizado para obter os dados de um user_token.
Se o usuário existe na base, pelo client-id ou pelo email do facebook, uma sessão é criada automaticamente.

GET /facebook/user-information
`access_token=aws`
`android_registrationid` (ainda não implementado, mas pode enviar)
`session:is_mobile=1`
`session:device_name=(modelo do celular)`

###### com sucesso

**REQUEST:**
```
GET /facebook/user-information
Content-Type: application/x-www-form-urlencoded

access_token=aws
```

**RESPONSE:**
```
200 OK
Content-Type: application/json
Charset: utf-8
Status: 200

{
    "session": {
        "roles": [
            "user"
        ],
        "email": "sem@senha.com",
        "created_at": "2015-02-23T15:03:09",
        "name": "criar sem senha",
        "type": "user",
        "id": 51,
        "api_key": "a3cdab83ca543b4a84e9ba0271784f90e5744a8ef7b3",
        "has_password": "1"
    },
    "facebook": {
        "link": "https://www.facebook.com/app_scoped_user_id/10203880851527296/",
        "timezone": -3,
        "name": "Renato Cron",
        "locale": "pt_BR",
        "last_name": "Cron",
        "email": "renato.cron@gmail.com",
        "updated_time": "2014-03-17T00:29:14+0000",
        "id": "10203880851527296",
        "picture": "https://m.ak.fbcdn.net/profile.ak/AWS",
        "gender": "male",
        "first_name": "Renato"
    },
    "has_account": 1
}
```

Caso o usuário não exista no nosso banco:
session não vai existir.
has_account vai ter o valor "0".

Caso o access_token seja invalido:

Response code 400, content:
{"error":"form_error","form_error":{"access_token":"invalid"}}

Caso o access_token foi expirado:

Response code 400, content:
{"error":"form_error","form_error":{"access_token":"expired"}}





Atualizar usuário

Atualizar campos do usuário

sucesso:

PUT /users/123
Campos aceitos (nao precisa ser enviados todos)
password
name
gender
telephone
email


**REQUEST:**
PUT http://localhost/users/89
Content-Length: 68
Content-Type: application/x-www-form-urlencoded
X-Api-Key: 646da97e8b0672d48f55a30abfdb98935544a01a

name=AAAAAAAAA&email=foo2%40email.com&password=foobarquux1


**RESPONSE:**
202 Accepted
Location: http://localhost/users/89
Content-Type: application/json

{"id":89}




Logout

Expira a `api_key` e também a `android_registrationid` dessa sessão, caso exista.

sucesso:

**REQUEST:**
```
POST /logout
Content-Length: 52
Content-Type: application/x-www-form-urlencoded

api_key=21c03078e45cd350a36128ed90892497804be2b24938
```

**RESPONSE:**
```
200 OK
Vary: Content-Type
Content-Length: 15
Content-Type: application/json
Charset: utf-8
Status: 200
X-Catalyst: 5.90083

{"logout":"ok"}
```


#### Reset de senha por e-mail


POST /user-forgot-password/email
Campos obrigatórios:
`email`

**REQUEST:**
```
POST /user-forgot-password/email
Content-Length: 21
Content-Type: application/x-www-form-urlencoded

email=foo%40email.com
```

**RESPONSE:**
```
200 OK
Vary: Content-Type
Content-Length: 16
Content-Type: application/json
Charset: utf-8
Status: 200
X-Catalyst: 5.90083

{"message":"ok"}
```


#### Criar grupos


POST /groups?position_visibility=admins&name=Foo+Bar
Campos obrigatórios:
`name`
`position_visibility=["admins" ou "members"]`

**REQUEST:**
```
POST /groups?position_visibility=admins&name=Foo+Bar
X-Api-Key: 114d61b96af3921af1841940e612a5ca10cfb247
```

**RESPONSE:**
```
201 Created
Location: http://localhost/groups/16
Vary: Content-Type
Content-Length: 9
Content-Type: application/json
Charset: utf-8
Status: 201
X-Catalyst: 5.90085

{"id":16}
```

Atualizar grupos
Para atualizar, só pode enviar o "name"

`PUT http://localhost/groups/16?name=123`

Respose code esperado: `202 Accepted`



#### Listar grupo criado

**REQUEST:**
```
GET http://localhost/groups/$id
X-Api-Key: 114d61b96af3921af1841940e612a5ca10cfb247
```

**RESPONSE:**
```
200 OK
Vary: Content-Type
Content-Length: 262
Content-Type: application/json
Charset: utf-8
Status: 200
X-Catalyst: 5.90085

{
    "data":  # agora nao eh mais uma array se nao foi pedido com with_history => 1
        {
            "deleted_by": null,
            "position_visibility": "admins",
            "name": "Foo Bar",
            "created_by": {
                "id": 389,
                "name": "FooBar"
            },
            "valid_to": "infinity",
            "valid_from": "2015-04-28T13:36:53"
        }
    ,
    "id": "16",
    "created_at": "2015-04-28T13:36:53",
    "created_by": {
        "id": 389,
        "name": "Foo Bar"
    }
}
```

#### Listar grupos

**REQUEST:**
```
GET /groups
X-Api-Key: 114d61b96af3921af1841940e612a5ca10cfb247
```

**RESPONSE:**
```
200 OK
Vary: Content-Type
Content-Length: 273
Content-Type: application/json
Charset: utf-8
Status: 200
X-Catalyst: 5.90085

{
    "groups": [
        {
            "data": {
                "valid_to": "infinity",
                "deleted_by": null,
                "name": "Foo Bar",
                "position_visibility": "admins",
                "created_by": {
                    "id": 389,
                    "name": "Foo Bar"
                },
                "valid_from": "2015-04-28T13:36:53"
            },
            "id": "16",
            "created_by": {
                "id": 389,
                "name": "Foo Bar"
            },
            "created_at": "2015-04-28T13:36:53"
        }
    ]
}
```

#### Apagar grupo

`DELETE http://localhost/groups/$id`

Response code esperado: `204 No Content`

Listar grupos deletados

`GET /groups?with_deleted=1`



Criar notificacoes (sirene, wipe, etc)


`POST /notification-messages`

Codigo esperado:

`code  => 202,`

```
code     => 'ABC',
data     => '{}',
event_id => random uuid
```
Onde `abc` é um dos seguintes:

#### Gerar invite para um grupo

Campos aceitos (nao precisa ser enviados todos)
`email`
`telephone`


**REQUEST:**
```
POST /groups/58/invites?email=renato.cron%40gmail.com&telephone=1231212323
X-Api-Key: 076da69fc3b4005cbbc710d183ab5c7e28ee1ca9
```

**RESPONSE:**
```
200 OK    
Content-Type: application/json
Charset: utf-8

{"code":"5ZKE9-L84U1"}
```

obs: se enviar 1> vezes o mesmo email ou telefone, o codigo retorando é o mesmo.

#### Entrar em um grupo

Campos 
`code`


**REQUEST:**
```
POST /groups/invites/accept?code=HPFSG-D8D8A
X-Api-Key: 50f2dda8e4d6038dfbaca42d2cfc19c1d2366ee4
```

**RESPONSE:**
```
200 OK    
Content-Type: application/json
Charset: utf-8

{"member_id":108}
```

Se code não existir, retorna `404`.
Se code foi utilizado por outro, retorna `400`.

Listar usuarios de um invite:

**REQUEST:**
```
GET /groups/invites/stalk?code=C8BAE-W97EZ

**RESPONSE:**
{"members":[{"email":"foo1@email.com","name":"Foo Bar","profile_picture_url":null,"admin":"1"}]}
```



Apagar um invite (tanto para admin quanto um usuario recusando a entrada):

**REQUEST:**  
`DELETE /groups/invites/accept?code=HPFSG-D8D8A`

Response:  
`204 no content`


Sugestoes de grupos

**REQUEST:**  
`GET /users/group-suggestions`

**RESPONSE:**
```
{
    "suggestions": [
        {
            "group_name": "Foo Bar",
            "invited_by": {
                "profile\_picture\_url": null,
                "name": "Foo Bar"
            },
            invited_at:  "2015-05-02T23:36:12"
        }
    ]
}
```




Listar membros do grupo

request:  
`GET groups/243/members`

**RESPONSE:**
```
{
    "members": [
        {
            "name": "Foo Bar1",
            "email": "foo1@email.com",
            "profile\_picture\_url": null,
            "admin": 1,
            "creator": 1
        },
        {
            "email": "foo2@email.com",
            "name": "Foo Bar2",
            "profile\_picture\_url": null,
            "creator": 0,
            "admin": 0
        },
        {
            "profile\_picture\_url": null,
            "email": "foo3@email.com",
            "name": "Foo Bar3",
            "admin": 0,
            "creator": 0
        },
        {
            "creator": 0,
            "admin": 0,
            "email": "foo4@email.com",
            "name": "Foo Bar4",
            "profile\_picture\_url": null
        }
    ]
}


#### setar um membro como admin

**REQUEST:**
`POST /groups/283/admins?member_id=412`

**RESPONSE:**

`204 no content`

obs: pode receber `403`.


#### Remover um membro de admin

**REQUEST:**
`DELETE /groups/283/admins?member_id=412`

**RESPONSE:**
`204 no-content` 


pode retornar `400` se tentar remover admin do criador do grupo (aka: pagador).
pode retornar `403`.

Remover membro do grupo [aka: sair de grupo]

**REQUEST:**
`DELETE /groups/298/members/459`

pode retornar `403` 
pode retornar `400` se tentar remover o criador do grupo.

por enquantos, usuarios nao podem sair do grupo sem ser 'expulso por um admin'

#### Enviar posicoes de um usuário (celular)

Ele tambem pode receber o `location`, `location_wcdma`, etc..
ps: nao tem `photo_id`

**REQUEST:**
```
POST /users/1322/status
Content-Length: 2036
Content-Type: application/json
X-Api-Key: bf3a7e98744d88322af4c810d33a6d0da15b982a

{
    "status": [
     {
    "status": {
        "mId": 27,
        "mac_adress": "9c:d9:17:d7:91:21",
        "serial_number": "0431156792",
        "wifi_signal_strength": -127,
        "mobile_signal_strength": -111,
        "imei": "353320060590572",
        "android_version": "5.0",
        "iccid": "89553900030018157362",
        "operator_name": "Nextel",
        "mobile_phone_number": "5511947718732",
        "bluetooth_uuid": "9C:D9:17:D7:91:20",
        "imsi": "724390001815736",
        "version_release": "1.7",
        "model_number": "motorola XT1097",
        "mobile_network_type": "3G"
    },
    "created_at": "2015-04-10T23:14:27Z",
    "battery_level": 29,
    "plugin_code": "f24.photo",
    "network": {
        "wifi": {
            "ssid": "<unknown ssid>",
            "mac_adress": "9c:d9:17:d7:91:21",
            "link_speed": "-1 Mbps",
            "bssid": "null"
        },
        "mobile": {
            "mobile_network_type": "3G",
            "conected": true,
            "avaliable": true
        }
    },
    "is_battery_charging": false,
    "mId": 27,
    "location_wcdma": {
        "mcc": [
            724,
            2147483647,
            2147483647,
            2147483647,
            2147483647,
            2147483647
        ],
        "lac": [
            51101,
            2147483647,
            2147483647,
            2147483647,
            2147483647,
            2147483647
        ],
        "psc": [
            295,
            294,
            379,
            111,
            384,
            109
        ],
        "cid": [
            7551215,
            2147483647,
            2147483647,
            2147483647,
            2147483647,
            2147483647
        ],
        "network_name": "WCDMA",
        "photo_id": "c95ccb69-1431-493a-8ba1-fac5f9377c26",
        "mnc": [
            39,
            2147483647,
            2147483647,
            2147483647,
            2147483647,
            2147483647
        ],
        "mId": 8
    }
}
    ]
}
```

**RESPONSE:**
```
202 Accepted
Vary: Content-Type
Content-Length: 11
Content-Type: application/json
Charset: utf-8
Status: 202
X-Catalyst: 5.90085

{"id":"97"}
```

Criar notificacao:
```
POST /notification-messages?code=mode%3Apanic&data=%7B%7D
X-Api-Key: a8c8f20f3173e50e26411f9206256d2d5c3449d5

202 {"id":"166"}
```
Listando todas, mais recentes vem antes:
```
GET /notification-messages
X-Api-Key: a8c8f20f3173e50e26411f9206256d2d5c3449d5

{
    notifications:  [
        [0] {
            actions             :  {
                read:  {
                    method:  "DELETE",
                    url   :  "http://localhost/notification-messages/289"
                }
            },
            code                :  "mode:panic",
            created_at          :  "2015-05-29 18:16:31.567877",
            data                :  {},
            participating_groups:  [
                [0] 863
            ],
            read                :  0,
            user_id             :  3326
        }
    ]
}
```

Marcar notificação como lida

DELETE http://localhost/notification-messages/1436/166
X-Api-Key: a8c8f20f3173e50e26411f9206256d2d5c3449d5

Status do Device

GET /device-status
X-Api-Key: 901c09dd0ca222d7d64db7b929d1710ebade7e13

 [0] {
        email    :  "foo1@email.com",
        id       :  3753,
        name     :  "Foo Bar1",
        status   :  {
            checkpoint            :  {
                status:  "unknown"
            },
            device_locked         :  {
                status:  "unknown"
            },
            device_unlocked       :  {
                status:  "unknown"
            },
            device_wipe           :  {
                status:  "unknown"
            },
            gps                   :  {
                status:  "unknown"
            },
            mode_panic_audio      :  {
                created_at:  "2015-06-08 16:06:12.856878",
                path      :  "https://.s3.amazonaws.com/3ee0/97a73b/2015-06-08T19:06:13/3753?AWSAccessKeyId=&Expires=2056022152&Signature=BXCmy5Yqp8%2BZBRiQrPxQ9Ob37uY%3D",
                status    :  "ready"
            },
            mode_panic_photo_back :  {
                status:  "waiting"
            },
            mode_panic_photo_front:  {
                created_at:  "2015-06-08 16:06:12.856878",
                path      :  "https://.s3.amazonaws.com/16de/59c60d/2015-06-08T19:06:13/3753?AWSAccessKeyId=&Expires=2056022152&Signature=9NN7VznplG3BUJ6uZZEJfI7S1nc%3D",
                status    :  "ready"
            },
            panic                 :  {
                body      :  {},
                code      :  "mode:panic",
                created_at:  "2015-06-08 16:06:12.856878",
                event_id  :  1234,
                status    :  "mode:panic"
            },
            power                 :  {
                status:  "unknown"
            }
        },
        telephone:  undef
    }







anotações

TODO:


GET /groups/11/map



30 dias de notificacoes.

GET /notifications

{ id => 1, read => 0, , ...  }
{ id => 1, read => 1  }


GET /notifications?since=.....

{ id => 1, read => 1  }


GET /user-info?user_id=12




