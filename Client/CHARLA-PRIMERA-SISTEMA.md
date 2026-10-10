

Si, porque en base a ese código ya podríamos hacer la trazabilidad, dependiendo a los documentos que ellos nos manden, ¿verdad? Exactamente. Sería el punto pivote. Algo que quisiera saber, pero no estoy muy seguro de esto, ¿los códigos se repiten? ¿Usted cree? ¿Ha visto? No creo que se repitan, porque, bueno, depende mucho de la nomenclatura que manejen allá, el proveedor, pero ellos también lo manejan como para hacer su propia trazabilidad.

Ah, bueno, cierto. Entonces, si es que tuvieran dos similares, se les cruzaría también a ellos. Sí, es verdad. 

Ahora, aquí quería mostrarle una cosita. Una vez que una bobina ya está reingresada, ya no viene empaquetada, ¿verdad? Ya no tiene la ficha ni nada. Ya no, porque la sacan, es lo primero que sale. 

Solamente va a quedar como stand-by, pero vacía, o sea, está ahí esperando. Y esta es la característica. El otro día me ha puesto a pensar en la trazabilidad.

Sí. Y cuando una bobina es reingresada, le va a aparecer este mensajito de reingresada. Ya.

Así, cuando vea la bobina en el inventario, va a decir, ah, ya, esta es la que quiero trabajarla. Ya. Y como no es un caso muy recurrente, puede que solo haya una.

Claro, exacto, exacto. Exactamente por eso. O sea, eso le va a ayudar a entender, porque, digamos, si reingresamos la bobina y vuelve a aparecer con su código acá, va a ser casi difícil de encontrarlo.

Ya, claro, correcto. Ya. Ahora, va a tener todas estas vistas. 

Obviamente, solo he cargado datos de prueba de la ficha que yo saqué hace tiempo. No ve de bobinas de papel higiénico. Ya.

Ahora, acá, para facilitar, a ver, vamos a ir cargando un poquito lentito esto. Lo voy a refrescar. Ya, ahora sí.

Acá, para facilitarle al usuario en el celular, está aquí por el desarrollo. Ah, ahí están los reportes. Y aquí, inventario.

Para facilitarlo, va a tener que moverse a la otra pestaña. Esto está aquí por la manejabilidad, ¿me entiendes? Mira, así se ve en celular, por ejemplo. Ya.

Todo va a estar en columna. Y como puede ver acá, estos botoncitos de aquí, ahorita los vamos a ver, pero principalmente este, descarga un reporte PDF del inventario. Ya, ok.

Mira, a ver, vamos a abrirlo ahorita, lo voy a guardar. Lo abrimos por el charito. Y este nos va a devolver, de todos los estados, de todas las bobinas, nos va a devolver su inventario.

Ya, ok. Mira, a ver, recargo lentito. Ahí está. 

Mira, tenemos 4 de económico y 4 de higiénico y 1 económico. De todas ellas no sale porque no tengo. No hay.

Ya, ok. Y va a mostrar los datos, el código, a qué lote pertenece, a qué número, la fecha de recepción, el proveedor, peso bruto, peso neto, gramaje. Ya, ok.

Ese es el primer estado de una bobina dentro del sistema. Y como ustedes lo manejan igualmente. Ya, perfecto.

Eso permite descargar un reporte así rápido. Va a facilitarlo. Ahora, para un operador, por lo menos, va a permitirse manejarse así. 

Va a ir entre la producción o el inventario. Ya. Ahora, aquí en la producción, esto aquí tengo una duda, no sé si he dejado un hueco de trazabilidad.

Ya, es como usted me dijo. Se inicia una producción, una cargada, con dos bobinas, por ejemplo. Estas bobinas tienen el siguiente estado. 

Un encargado de producción puede cancelar la producción solamente al estar pausada. ¿Es correcto? Ya, ok. Sí, sí.

Porque usted me mencionó, y ahora, acá, permite insertar los logs directamente, ¿me entiende? Ya, que se ha hecho durante esa producción, esa cargada, ¿verdad? Exacto. Y aquí el operador selecciona qué movimiento quiere, por ejemplo. Si es un ingreso, es un ingreso directo a la producción.

Porque la producción va a ir almacenando la cantidad de logs que está produciendo. Aquí tengo una duda. ¿Aquí puedo dejar un campo predefinido como 10, o lo dejo en cero? En cero, porque es bastante. 

Pueden ser unas 600 bobinas, como 400, por ejemplo. Ah, ya, ya, ya. Entonces aquí puede meter lo de 100 en 100, por ejemplo, ¿verdad? Los logs.

Sí, sí, correcto. Ah, ya, ya, ya. Entonces ya voy a poner un límite. 

Por ejemplo, un límite, por lo menos, sería de unos 1000, digamos. Que no puede ingresar más de 1000. Sí, sí. 

Que de hecho no puede llegar, tal vez lo máximo que salga de un par de bobinas madre sería unos 700. Ah, ya, ya. Entonces si el límite va a ser 1000 lo voy a poner, porque de momento lo dejo en 50.

Lo que quiero evitar es que por lo menos, digamos, lo hagan así, ¿me entiende? Y no vulneren los campos, por lo menos. Pero aquí si estuviéramos hablando del total producido, ¿verdad? No, de los logs, de lo que me dijo que sale del intermedio antes de la producción. Sí, exacto.

Ahora, pero mi duda es acá. Al crearse una producción, ¿es necesario saber qué productos está elaborando, o no, obligatoriamente? Eh, sí sería importante que se pueda saber cuál se está haciendo. Porque son diferentes logs, ¿verdad? Sí.

Depende a lo que se vaya a producir. Ahora, lo que pasa con, una vez se inicia esta cargada de bobinas, ¿verdad? Sí. Es que de esa misma bobina puede salir mitad de un producto y la otra mitad de otro.

Ah, ya entiendo. O incluso avanzar, no sé, una media hora de sacar un producto y luego pasarse a una hora de otro producto. Ya. 

Eso puede ser medio parcial. Exacto. Y de hecho puede ser intermitente. 

Puede ser, no sé, sacar unas 10 bobinas, o sea, poquitas, de un producto y luego saltarse al otro. Ah, ¿y eso basado en qué lo hacen, por lo menos? Eh, ¿qué demanda hay? Por ejemplo, se nos puede haber acabado bobinas de Ecopack. Sí.

Entonces vamos a tener que crear bobinas de Ecopack al inicio de producción. Hasta terminar, no sé, necesitamos 50 logs. Sí.

Y de esos 50 logs ya tenemos el stock, ahora pasaremos a Megaloil. Entonces, en la misma cargada de bobinas va a saltar entre un producto u otro. Ah, ya, pero la producción, y bueno, en ese caso pueden suscitarse igual los empalmes, todo, ¿verdad? Exacto.

Ah, ya, eso voy a estar viendo cómo hacerlo. Le voy a hablar si es factible, por lo menos en el punto que tengo construido, pero ¿es totalmente necesario o no? A ver, déjalo pensar. Porque ahora, aquí por ejemplo, en una vez, vayamos a colocar un dato.

Pongamos un ejemplo. Se pone como cantidad de los producidos, por ejemplo, 20, ¿verdad? Sí. Ya, 20.

Ok, luego siguen produciendo el mismo. ¿A esto se le puede sumar? O sea, ¿esto es 20? Sí, puede ser una suma. Una suma. 

Es decir, seguimos produciendo y ahora he contado otros 30, por decir. Exacto. Entonces sigue sumando.

Sí. Lo único que no está haciendo ahora es diferenciar entre qué... Entre qué producto. Ya, ok.

Entre qué producto... A ver, déjamelo anotar. Pero luego, o sea, el registro de producto final está totalmente separado. Y esto es por eso lo que le decía.

Por lo menos las producciones van a tener su estado de continuidad, como hemos hablado, por ejemplo. Podemos pausarlas. Ya.

Va a tener sus motivos, así, ya predefinidos. Falta de pegamento, falta de personal, empalme en la bobina, tanto. Vas a ver qué bobina tiene el empalme.

Sí. Lo habla, o también es el campo vacío. Obviamente esto permite, igualmente, agregar ya directamente para facilitar el registro.

Sí, sí, sí. Eso va a ser para facilitarlo. Pero ahora, ¿qué tan importante sería eso? ¿Sería algo directo? Porque esto ya... Sí, sí es importante.

Lo único que me queda duda es, por ejemplo... Este dato va a ser importante para saber, por ejemplo, de este par de bobinas que hemos cargado, ¿verdad? Sí. ¿Cuántos locks han salido? Sí. Ahora, eso depende del metraje de cada lock.

Lo que varía entre locks son los metros nada más. El producto es lo mismo. Entonces no va a ser lo mismo que de un par de bobinas hayamos sacado, no sé, 500 locks de un producto, cuando de un lock que necesite más metros no van a ser 500, ¿verdad? Van a ser 400, porque en cada lock entra más metros.

Sí. Y para hacer esa comparación entre de qué producto sale más o menos locks, sí sería importante determinar, no la cantidad de locks, sino el producto. Exacto.

Ah, ya. Entonces lo que podríamos hacer es básicamente ahora, para cada producción, seleccionar su producto. Exacto.

Pero de esa misma producción poder alternar a otro producto. Exacto, correcto. Ah, ya, ya. 

Pero el contador se reinicia. Ya, ok. Se reinicia, ¿verdad? Ok.

Porque sería inútil, digamos, de una misma producción sacar 100 locks, pero... Cuando ya cambia a otro, sumarlo a eso, porque es otro producto. Claro, claro. Ah, ya, me parece perfecto, me parece perfecto.

Exactamente. Ya, ya, ya se me ocurrió el flujo para eso. Está bien entonces.

Entonces ahora, pero, quiero saber si el flujo de la producción está correcto. Sí. Por ejemplo, ahorita voy a pausar hasta que le agregue 20.

Ajá. Digamos, no sé si es falta de pegamento. Sí.

Pausamos. Nos vamos acá. Y aquí va a tener, por eso, la facilidad de alternar entre la vista de activas.

O sea, producciones que actualmente están activas. Ahorita aquí al filtro, entonces, lo que me faltaría agregar más que todo por filtro de bobinas, sería agregar el filtro por productos, ¿verdad? Sí, exacto. Ah, ya, perfecto, perfecto, perfecto.

Ya, eso está perfecto entonces. Ahora, acá habría que, bueno, igual se puede agregar logs a pesar de que la bobina, la producción está pausada. Ya.

Por si, digamos, han sacado lo último y lo han pausado. Sí, exacto, exacto. Y lo mismo, ingreso significa que va a ingresar directamente.

Ya. Descuento quiere decir que, digamos, había 20 en la vida real, pero por accidente ha metido 25, digamos. Ajá.

Le descuente esos 5 y pone motivos. Error de registro de logs, digamos, y le pone 5. Exacto. Aumento quiere decir que, por lo menos, digamos, hay 20 igualmente, ¿verdad? Sí.

Por accidente solo ha metido 10. Ajá. Y le mete a 10 nomás.

Pero este movimiento creo que está un poco confuso, ¿no? Mejor sería entre ingreso y descuento, ¿verdad? Claro, porque el aumento sería la inversa, ¿verdad? Exacto. O aumento el restante. Sí.

Directamente en el ingreso, como ingreso 10 más. Exacto. Entonces, eso del aumento igual lo voy a quitar nomás, no estaba muy seguro.

Entonces, ingreso y descuento. Ok, ok. Ya.

Entonces, aquí solo nos faltaría definir a qué línea es y poder, una producción, cambiarla de línea. Sí, exacto. Alternar, ¿verdad? Exacto, sí.

Ya sea un producto o otra. Exacto. Ya.

Eso de alternarlo de línea solo va a poder hacerlo un encargado de producción. Está bien, porque si no cualquier operador se puede confundir o lo va a cambiar. Sí, a ver, déjame pensar.

Lo anotaré, por favor, y se lo confirmo. Ya. Le voy a pasar igual el sistema a la URL.

Ya. Y le voy a dar un usuario de prueba con el que estoy trabajando y lo va a ver. Le voy a pasar a ambos usuarios.

Ok. El operador. Ah, ya, ya, ya.

Y el encargado. Ok, ok, ok. Como yo estoy haciendo mis pruebitas de despliegue para ver cómo rinde y todo.

Ok. Ya, ok. Ya, perfecto.

Ya, entonces, lo que nos faltaría sería agregar eso. Vamos atrás. Ahora aquí.

Aquí está bien todo esto, ¿verdad? La producción se puede finalizar. Aquí voy a agregar un apartado solo para el encargado, donde va a estar para ver las finalizadas. Ya.

Porque va a haber reportes diarios de producción, ¿verdad? Sí, sí. Ok. Ya, perfecto.

O sea, va a haber reportes, más allá de la producción del producto terminado, sino reportes diarios de toda la producción, las pausas, las cancelaciones, la duración de las pausas, etc., ¿verdad? Ok, ok, ok. Está bien. Y eso va a ser el diario, ¿qué tanto lo va a necesitar el reporte de producción? Diario, mensual y semanal, ¿verdad? Sería lo más efectivo.

Sí, exacto. Sí, sería lo diario. Porque luego vamos a ver el apartado de reportes.

De poderse sacar diario, semanal y mensual, se puede en el sistema. Ok, ok. La cosa es facilitar eso, porque luego lo otro es un calendario que es un poquito, va a haber ahorita.

Ya. Pero aquí voy a agregar otro apartado para ver las producciones terminadas y que pueda sacar un reporte diariamente al finalizar el día. Sí, ya, está bien, ya.

Ya. A ver, vamos a ver el siguiente. Bobina, servilleta, igual ya tiene cáncer, lo que habíamos hablado.

Ya. Aquí está. Ahora, acá la vista se diferencia un poco.

Espera, voy a revisar acá. La vista se diferencia un poco. Son tres almacenes, se podría decir.

Ya. Uno es para las bobinas cerradas. Ya.

¿Qué tiene una bobina cerrada? Tiene el número de bobina, la recepción, el proveedor, la unidad uno, como he dicho que son dos unidades. Sí. Con su codigo y su formato que es 435 x 3. Ajá.

Y la unidad dos, que es 435 x 2 más... Más 235, correcto. Exacto. Ahora, ¿qué va a pasar al abrirse una bobina? Se van a liberar a estos inventarios.

Mire, hay dos inventarios. Hay uno que es el de 435 y hay otro que es el de 220. Ya, ok.

Aquí el seguimiento tiene que ser bastante riguroso porque el otro es más fácil de buscar por código, ¿verdad? Sí, correcto. Y es más fácil ver sólo una bobina. Exacto.

Acá, por lo menos cuando se ingresa a la producción, tiene que tenerse al tanto al haberse abierto. Igual va a mostrar lo de reingresado, por cierto, si ves algún error o algo. Ya, sí.

Y ya. Entonces, acá directamente se va a mostrar el número de la bobina. Ya.

Y a qué unidad pertenece. Sí, claro, claro, porque una vez se quite el código quedan sueltitas, pero sin código individual, ¿verdad? Exacto. Se va a mostrar todo eso.

La cosa es que siempre se tenga mucho cuidado. Aquí obviamente el código no importa mucho, pero la cosa, para mantener el stock de la vida real y el stock del sistema, siempre que se registre una, tiene que mandarse obligatoriamente. Ya.

Si no, ya va a haber descontinuidad y como el sistema, por eso, aquí vamos a iniciar por ejemplo una producción. A ver, iniciémosla. Vamos a iniciar.

Entra de uno en uno, ¿verdad? Sí. Perfecto, muy bien. Ya.

Ahora, para evitar todo eso, vamos a iniciar esta producción, ¿verdad? Ya. Por ejemplo, para cancelar una producción tiene que estar pausada, ¿ok? La vamos a pausar. Tiene casi lo mismo, solo que en este caso no se ingresan logs, nada, ¿verdad? Sí, exacto.

Aquí va a ser necesario igual en las servilletas distinguir la línea, ¿verdad? O directamente solo servilletas. Solo servilletas aquí, ¿verdad? Sí, solo servilletas. Ah, ya, ya.

Bueno, ahora te la comento. Ya. Lo que quería comentarle, me olvido comentarle en lo de bobina, todos van a seguir el mismo flujo.

Al cancelar una producción, vamos a poner, digamos, ahí le voy a poner los motivos predefinidos, volvemos al inventario y fuera de inventario se va a ver esto. Para ver una bobina fuera de inventario tiene que cancelarse su producción, solamente así. ¿Está bien? Sí, sí, correcto.

O sea, para que esté fuera de inventario, que es el estado 5 dentro del sistema, tiene que salir del... Ya. Y solamente se puede reingresar. Dar de baja nunca, ¿no? No, va a ser muy complicado.

Sí o sí vamos a tener que terminarlo. Ah, ya, ya, ya. Entonces nunca se les da de baja a las bobinas.

¿Puede ocurrir? Puede ocurrir, puede ocurrir. Ah, ya. Pero es muy raro.

Ah, ya. Entonces eso lo voy a agregar para un panel de administración todavía que lo estoy haciendo. Ok.

Un panel así donde usted, como es el líder de básicamente todos, va a hacer el registro de usuarios. Control de todos los movimientos, ingresos y salidas del sistema, eso todo usted lo va a tener. Ya, perfecto.

Ya, de momento, pero así estamos yendo. Entonces, ahora sí, ¿cuál me comentaba que era su duda? Decíamos que solamente una bobina puede entrar a producción de servilletas, ¿verdad? Pero existen dos máquinas. Sí.

Entonces sí se pueden ingresar ambas bobinas, ¿verdad? ¿Cómo es eso? Una de las máquinas utiliza solamente las del formato 335, que son las más grandes. Ah, sí, sí. Y la otra es la más pequeñita.

Ahora, en ese caso, sí entrarían a una producción ambas al mismo tiempo. Totalmente. ¿Verdad? Mire, por ejemplo, a ver, aquí tenemos, a ver, vamos a ingresar, a ver.

A ver, aquí voy a mostrar, sería bueno igual mostrar el formato en la producción, eso me está haciendo considerarlo. Por ejemplo, mire, vamos a agregar una de 220. Sí.

Que es la 01B, digamos. Sí. Que es su bobina de origen.

Ajá. Y aquí yo acabo de ingresar una de 435 anteriormente. Ajá.

Y las dos pueden... Y serían las dos, ya, ok. Eso es, eso es lo mismo. Mire, 01B, 02A.

Y esa era del... Son códigos de... De la granja. Ajá. Ya, perfecto.

Pueden estar las dos paralelamente, no hay problema en eso. Ok. La cosa es que... Ahora, acá, Will, es muy importante.

Todas las producciones, para no dejarlas levantadas todo el día y que la duración varíe. Ya. Tienen que finalizarse, obligatoriamente.

Una vez, ya, ok. Porque como esta acción es más manual. Sí.

El sistema no puede saber cuánto va a durar una producción, digamos. Sí. O si le ponemos una duración predefinida, puede que sea errónea por culpa de las pausas, empalmes.

Ya. Lo que sea. Ok.

Entonces, siempre que haya producciones, voy a tratar de poner algo que notifique si hay producciones activas y que obligue a pausarlas. Correcto. O acabarlas.

Correcto. Porque tienen que acabarse. Sí.

Si no, digamos, yo, por ejemplo, he hecho las pruebas y he dejado una producción un día, digamos. Ajá. Sale, pues, 24 horas que ha durado.

Incluso he dejado unas semanas. Claro. 300 horas, es decir.

Claro. Tienen que pausárselas. Sí.

Tienen que finalizarse. Finalizarse. Correcto.

Igual las pausas tienen que retornarse o cancelarse, dependiendo de la situación. Ajá. Porque igual al reanudar una pausa, digamos, le dejo igual unos dos días, sale 48 horas de duración de la pausa, digamos.

Ok. Todo eso tiene que andarse controlando. Ya.

Perfecto. Como tampoco no son como... usualmente tienen como una, tres producciones diarias, ¿no? Sí. Sí, sí, sí.

Claro, ¿no? Es mucho. Una vez termine su bobinar deberían finalizar el... Claro. No, la cosa es que, como le digo, no tiene muchas producciones.

El catálogo no se va a llenar, digamos, con diez, digamos, en un día. No, no, no. No.

No. No. No.

No. Sábamos, máximo cinco. Ah, ya.

Está bien. Entonces... Ya, entonces por eso no va a ser muy difícil de chequear eso. Ya, ok.

Así se va a distinguir. ¿Está bien? ¿Le parece bien el flujo, todo? Sí, sí. Todo bien.

Solo nos faltarían las bobinas y agregar la línea. Exacto. Y que se pueda cambiar esa misma producción a otra línea.

Exacto. Ya, eso está perfecto entonces. Igualmente como en el anterior, aquí se puede descargar directamente el inventario.

Este inventario es un poquito más distinto... Ya. Este es el inventario, por ejemplo, de la servilleta. Termina nomás.

Ahora, ¿qué va a reflejar este? Bueno, aquí me he tomado directamente el nombre que había en la ficha, pero le voy a poner bobina servilleta. No hay mucha variación en los tipos de bobinas servilletas. Solo hay uno, ¿no? Exacto, el gramaje que habíamos dicho, ¿verdad? Sí, exacto.

Pero le voy a poner bobina servilleta. Es más adaptativo. Ya, ok.

¿Qué va a mostrar? Primero va a mostrar, como se ve acá, las bobinas cerradas. Ya. Este inventario va a contener lo que son las bobinas cerradas, el proveedor, códigos, los formatos, peso bruto, gramaje, todo bien.

Luego, igualmente, va a mostrar las subbobinas, yo las he denominado. Ya. Lo que serían las subbobinas de 435 milímetros.

Ajá, exacto. Y las de 220. Ya.

Va a mostrar todas las que se encuentran en el inventario. Exacto. Para que el inventario, por eso, no varíe.

Siempre que se inicie una producción de cualquier tipo de cosa, tiene que registrarse. Está bien, ¿verdad? Sí, sí. Ya.

Sí, eso sería. Aquí para, igualmente, tanto como en bobina papel como en bobina de servilleta, si digamos hubiese habido algún error de registro o algo, se pueden editar los códigos, los códigos de cada unidad. En las otras bobinas, obviamente, sólo es un código.

El peso bruto, tantos tantos, gramaje y motivo de la corrección principal. Error de registro o algo. Igualmente voy a poner unas burbujitas acá que digan, sean accesos rápidos, directamente.

Ok. Ya. Luego de eso, podemos movernos acá.

Vamos a Rodela. Rodela es bastante simple, ¿no? Ya. Como habíamos quedado.

Directamente se van, sólo hay un tipo de Rodela, igualmente, ¿no? Sí. Ah, ya. Sólo hay un tipo de Rodela.

La selección es a Rodela y la traslada a producción. Ya. Como no vamos a quedar en el conteo de los tubos que salen para elaborar los locks.

Ya. Acá, en cuestión de la producción de Rodela, se tiene 30 minutos para reingresar al almacén. Ya.

¿Por qué lo he hecho así? Porque, digamos que se equivocó de código. Ya. Ok.

Digamos que se equivocó de código y quiere reingresarlo al almacén. Ya. La reingresa.

Digamos, error de registro de envío de Rodela a producción. Ya. Lo reingresa.

Ok. Se actualiza. Ok.

Volvemos al inventario y vuelve a enviarlo. Una vez pasados esos 30 minutos, la Rodela ya ha pasado a producción. Ya.

Y su estado ha cambiado dentro del sistema. Ya, ok. Eso está bien, ¿verdad? Sí, sí.

Igualmente se puede editar. En este, como no había muchos datos, directamente sólo el código está bien de las Rodelas. Ya, ok.

Está bien eso, ¿no? Sí. Y, bueno, el motivo de la corrección y lo que sea. Y ya con eso estaría esa parte, por lo menos de las Rodelas.

Eso es lo único que comprende las Rodelas, ¿verdad? Sí, sí. Es que ese palette que estamos llevando, ¿verdad? Sí. Son varias Rodelas apiladas.

Sí. ¿Verdad? Ahora, una vez ese palette con ese código que tenemos con varias Rodelas en la producción, se tienen que consumir todas esas, ¿verdad? Para ingresar la siguiente. Sí.

Ya, ok. Exacto, pues directamente cuando abren uno, es cuando está afuera. Y ahí se queda.

Ya. Como habíamos quedado la otra vez que no vamos a llevar el conteo de eso porque sería un poco más complejo. Ya, ok.

Ya, ahora, aquí en la parte de los empaques, aquí tenía algunas dudas. El empaque, por lo menos, de bobina. Ya.

¿Estar subdividido o directamente le llega un empaque en bobina para Ecopack? Y eso es para todos los productos de Ecopack, los que vienen en bobina. ¿De los empaques? Sí. De los plásticos, ¿verdad? Sí.

¿Cuál es la duda, verdad? Los empaques que son en bobina. Sí. Los de Ecopack, ¿sólo les llega de un tipo de Ecopack o son diferentes? Ah, sólo de un tipo.

O sea, ¿sólo les llega uno que se usa para todos los de Ecopack, por ejemplo, de esa bobina misma? No varía. No varía, pero sí mandan de diferente, ¿verdad? Es decir, no es la misma bobina de un Ecopack de 6 que de una de 12, ¿verdad? Ah, ya, ya, ya. O sea, de Ecopack va a haber empaques de bobina para el de 6. El de 6, 12 y el de 4. 4, 6 y 12.

Son las bobinas distintas, ¿verdad? Exacto. Ya, eso quería considerarlo igualmente. Ya, porque de momento yo lo tomo todo como Ecopack, Luxury y servilletas, pero en realidad están subdivididos.

Exacto, exacto. Ah, ya, ya, ya, ya, ya, ya. Entonces, si eso lo voy a corregir, porque yo pensaba que llegaba una bobina que era sólo para los 3 productos.

Ah, no, no, no. Es una bobina para cada producto. Exactamente.

Ah, ya, eso lo voy a corregir. Ahora, en cuestión tampoco no avanza mucho en eso de los empaques porque tenían dos. Sí.

Pero, a ver, igual en los empaques que venían en bolsa. Sí. Esos igual llegan para cada producto.

Exacto, ¿dices de las transparentes, de las pacas o del megarrollo? Usted me dijo que había unos empaques que llegaban en bolsas. No, no, no. Ah, sí, sí, sí, correcto, correcto.

Esos igual vienen. ¿Para qué productos? Voy a necesitar eso igualmente. Ya, ok, ok.

Porque ese vendría, los que vienen no en bobina, ¿verdad? Si no en bolsa sería de megarrollo, las servilletas. Sí. Ya, ok.

Eso lo voy a necesitar, por favor. Necesitas... Bueno, información de todos los empaques. O si podría obtenerla hoy, si tiene una fichita o algo, lo veo.

Ok. Tipo de empaque. Aquí lo voy a ver.

Bobina o bolsas. Bobina o bolsas. ¿Y qué productos son de cada uno? Exacto.

Cada uno. Ya, ok. Te mando esa información.

Igualmente para las bolsas de las jabas quisiera toda la información. Claro, que es similar. Exactamente.

Así ya recién podría ya empezar a hacer esta parte. Ya, ahora vamos a la parte del producto terminado. Acá en el producto terminado, obviamente este es un stock de referencia.

Porque usualmente manejan ya cantidades de dos mil, tres mil, ¿verdad? Ya, sí. Acá... Económico. Se puede ya directamente filtrar por productos.

Por ejemplo, del económico solo hay uno, ecopack, tantos, tantos. Ya. Igualmente que en las anteriores vistas, se puede navegar por la barra de aquí abajo, se puede ir directamente a movimientos.

Ya. Y, digamos, aquí se puede ingresar de uno a varios productos. ¿Me entiende, verdad? Ya.

Podemos ingresar, digamos, de económico, podemos ingresar cien, por ejemplo. Ya. Aquí, por ejemplo, ¿de cuánto en cuánto podrían ir ingresando? Este es solo un ingreso de los operadores del registro que van a embolsarlos.

Exacto. ¿Cuánto sería un límite prudente? Podríamos manejarlo cada cien igual. Porque, por ejemplo, pongamos un límite de quinientos, ¿ya? Ajá.

Les va a ser muy difícil contar quinientos. Va a ser mejor ponerles un límite de cien y cada vez que llegan a cien, vayan ingresando. Igual, entonces, que metan de uno hasta cien.

Ya. En un rango de uno a cien. Pueden meter cincuenta, veinte, treinta.

Exacto, correcto, correcto. De un rango de uno a cien. Ah, ya.

Cien está bien entonces, ¿verdad? Sí, sí. Ya. Pueden meter, digamos, económico y así mismo pueden seleccionar luxury.

Y aquí es donde le quería mostrar, no sé si este código que estaba haciendo está bien. Ya. Por ejemplo, mire, aquí se tiene el luxury.

Luxury Java de doce, quiero decir. Ya, ok. Del producto que es de doce.

Sí. ¿Está bien el código? Sí, sí, se entiende. Ah, ya, porque igual dice Java dos unidades por paquete, cuatro paquetes por Java.

Sí, exacto. Eso está bien igualmente, ¿verdad? Sí. Aquí igual les va a mostrar el stock todo para que vayan viendo, para que sigan haciendo el seguimiento.

Ya. Y, bueno, aquí igual pueden meterle, digamos, cincuenta. Pueden meter tanto de distintos productos simultáneamente.

Ya. Por ejemplo, si, digamos, está haciendo los tres luxuries, de los tres puede meterlos igualmente. Ya.

Y también podemos agregar otro luxury, por ejemplo, acá y ponerle, digamos, treinta. Sí. Y así puede ir metiendo de varios en varios.

Ya, perfecto. Y puede hacer varios registros de varios productos. Aquí directamente le pregunta, va a meter bla, bla, bla.

Exacto. Le dice confirmar y vayan a seguir ingresando. Ya, perfecto.

¿Esa parte está bien? Sí, sí, sí. Ahora, aquí se constituye igual de cuatro movimientos esto. Ya.

Este de aumento igual lo voy a quitar, como ya hemos dicho. Ya. Porque directamente el ingreso cumple lo mismo que un aumento, ¿no? Ya, sí, correcto.

Aquí existe la corrección, digamos. Solo es para uno, pero no puede ingresarse. Ya.

Digamos que se equivocó con el económico que ha agregado anteriormente. Exacto. Le vamos a echar, tiene ciento setenta ahorita.

Sí. Él la metió veinte, digamos, pero tenía que meter solo diez. Va a descontar diez.

Ya. Y le va a poner cantidad ingresada mayor a la real, digamos. Ingreso duplicado, por ejemplo.

Ah, ya. Todo eso se lo va a poner ahí y lo va a poder registrar. Ok.

Son motivos que pueden suceder, ¿verdad? Sí, correcto. Ya. Y básicamente de lo que estaba en ciento setenta ya se actualizó a ciento sesenta.

Ya. Para ir coordinando. Sí.

Ahora, cuestión de lo de aumento. Cumple lo mismo que anterior, pero igual lo voy a quitar. Ajuste positivo.

Esto ya va solo para el encargado o usted. Ya. Básicamente en un sistema de inventario siempre es buena práctica al finalizar la producción, hacer un conteo total de todo.

Ya. ¿Eso sería dificultoso o algo? No, no. Sí, cumple.

Sería una buena práctica. Y este ajuste positivo o ajuste negativo básicamente permite aumentar. Es como un ingreso.

Ya. Pero de cantidad.







o ajuste negativo básicamente permite aumentar es como un ingreso ya pero de cantidades más grandes lo que va a permitir por ejemplo y aquí quería preguntarle más o menos cuánto sería un máximo así para hacer una corrección digamos cuánto sería una varianza que exista entre los productos nunca nos ha pasado pero no debería ser mucho 1000 de límite por lo menos para el ajuste o es mucho no? 500? 500 tal vez digamos si quieres descontar de yo me refiero con el rango digamos de 1 a 500 que es un descuento claro, claro, si estaría bien 500 está bien verdad? si, si, si y luego igualmente con el ajuste negativo va a permitir hacer movimientos más grandes ya ok y así cuando sea el conteo final por ejemplo directamente usted con un ajuste digamos hay 100 de más por ejemplo, ya ok, cosa que limita a un operador de corrección que es netamente estos movimientos están limitados solo a ingresos después de la producción el ajuste positivo lo que va a hacer es digamos si faltan 100 o hay 100 más de más va a meter directamente, ya ok, igualmente el ajuste negativo va a recortar esos 100 pero de 1 a 500 está bien verdad? si, si, si ya ok, así estaría bien para mantenerlo por lo menos y es igual que estos otros dos movimientos solo permite de 1 por ejemplo ya, entonces hay 500 lo voy a poner, ok, ok sí, ahora aquí tenía una duda en cuestión del producto terminado es necesario saber de qué producción viene o no? el producto terminado, o sea digamos hemos iniciado una producción de copaca a las 11 de la mañana, blablabla, acabó es necesario saber qué productos vienen de ahí o no? eso para la trazabilidad va a ser necesario o todavía? puede que sí, a ver por ejemplo cómo sería o sea directamente acá ingresamos los productos pero no se sabe de qué producción vienen ay, ay, ay, ay es necesario saber eso? a ver, déjame pensar sí, sería ideal poder saber de qué producción vienen, igual es un tanto complicado porque nuestro stock no es tan grande, o sea es muy pequeño y va fluctuando de manera rápida también, no tenemos un stock que haya sido de hace dos semanas por ejemplo, quizás como unos cuantos días lo que me preocupa si es que haya pasado con un lote en específico es saber de qué producción es ah, ya verdad? pero es muy no como un registro que podamos hacer la trazabilidad de aquí a un mes o sea, es muy corto ya veo, entonces no es tan necesario, no? no, no, porque es muy corto almacenar estos datos como te decía, no va a ser como que hicimos esto de hace un mes porque nunca dura tanto tiempo claro, eso va más para los perecederos, por ejemplo sí, correcto entonces no es necesario saber de qué producción vienen? no, sería, tuviéramos que además afilarlo por fechas? por fechas, por lotes y se va a mezclar sí, entonces mejor que todo esté así está bien entonces el juego, verdad? sí, correcto ya, entonces lo único que me faltaría corregir sería en la bobina de papel a qué línea pertenece, verdad? sí ya, ahora, aquí viene ya la otra parte aquí igual me faltaría hacer salida de inventario me faltaría hacer un movimiento eso va un poquito ya anexado al área de ventas exacto, que se ve como unos despachos, verdad? exacto eso que hay en esto, cuánto ha salido, cuánto se ha vendido, cuánto se ha despachado exacto, eso directamente tendría que calcular el precio total, verdad? de todo lo que ha salido, porque es la única forma en la que sale el producto ya más allá de los repartidores que descuentan y van vendiendo, verdad? sí, sí, sí ah, ya aquí lo tomaríamos como que ha salido exacto, exacto solo serían salidas y se va a tener un copteo de una salida ya, ok ah, ya, porque ahorita más que todo el proyecto está delimitado entre el área de inventario y de producción ya luego ya después de la universidad ya obviamente la área de ventas todavía vamos a comprender, pero para no complicarlo de momento hacer un reporte directamente, que se saque un reporte y que se tome como una salida exacto, exacto, exacto salida de inventario, no una corrección, sino una salida exacto, solo salida y cuánto sale, sabe? o sea, cuánto sería un máximo que sale, cuántos son los números que salen aproximadamente varía mucho, porque por ejemplo diario si sacan producto, los repartidores de acá de azúcar si y sacan, no sé, por ejemplo de un producto de megalodio pueden sacar 200 megalodios puedo decir pero también existe la posibilidad de que llegue un tráiler y el tráiler saca como 4 mil ah, ya, ya ahora los repartidores de acá siempre van a sacar un máximo de 150, 200 nunca van a sacar 4 mil pero llega el tráiler y el tráiler si va a cargar 4 mil ah, ya, ya pero ambos cuentan como salida ah, ya, ya, está bien, está bien entonces indirectamente que sea una salida pero que se tenga un reporte de ello exacto sí correcto ya, entonces eso va a ser una salida, entonces pueden ser números altos digamos un límite de 10 mil, por ejemplo, estaría bien un límite total máximo tal vez 5 mil allá, 5 mil, no sobrepasa eso no, no, no ya, 5 mil está bien entonces exacto ya y bueno, eso sería más que todos los avances que tengo luego mucho de eso ya va más allá para la arquitectura del código y todas esas cosas por ejemplo, una cosa que es interesante del sistema es que usted cuando cierre la aplicación, cierre el navegador por accidente la sesión se mantiene durante 12 horas continuas ya para que, digamos, un operador no pierda tiempo otra vez iniciando sesión sí, sí, sí sino que, por ejemplo, a ver por ejemplo, a ver, voy a cerrar esto del navegador, mira ya esperamos un ratito que vuelva a cargar, ahorita va a volver a cargar y la sesión se mantiene iniciada, por ejemplo, mira aquí, lo voy a cerrar igualmente aquí y la sesión se mantiene donde lo ha dejado ok eso es totalmente para que no pierdan el tiempo otra vez reingresando al sistema que se haya desbloqueado, etc. ya directamente, automáticamente la aplicación ajá pide, digamos, si sí ha mantenido las 12 horas sí lo que podría durar un turno, ¿verdad? exacto se mantiene y dice, ah ya, sí se mantiene, le devuelve y le da el acceso ya, ok totalmente para evitar el tiempo eso, para evitar perder tiempo ok ahora vamos al área de reportes














Ya, ahora sí. A ver si ya cargó en la aplicación. No, sigue cargando.

Que sigamos. Ahora, aquí en el área de reportes... Ay, Iván, un ratito volvamos. No olvido mencionar los ingresos, Iván.

Aquí para igual registrar los ingresos, como habíamos hablado la otra vez, se va a poder registrar sólo uno de cada tipo, por lo menos en la bobina de papel. Se pueden registrar varios, pero de sólo un tipo. Por ejemplo, como le llega en la ficha, ¿verdad? Sólo le llega una de bobina económico, una de higiénico y una de toalla.

¿No viene mezclado o viene mezclado? No, no viene mezclado. Ah, ya. Así, igual que en la ficha, va a ingresar un lote directamente.

Y va a ir agregando ahí, agregando. ¿Qué campos va a agregar? Como usted me dijo, código, peso fruto, peso neto, gramaje. Y va a poder hacer eso de uno de económico, sino una de higiénico o de toalla.

Sólo se va a poder escoger entre esos. ¿Está bien eso, verdad? Sí, sí. Y así va a ser para toda la materia prima, por lo menos.

Aquí varía un poquito. Bueno, primero hay que seleccionar el proveedor. Eso igual que hiciera los proveedores si tuviese una listita, de los que ya son los oficiales.

Eso igualmente, por favor. Nombre celular, con eso vale y es suficiente. Igual van cambiando de proveedores, ¿no? Sí.

Así que sí, el sistema va a... Usted tiene ese panel de administrador, que es lo último que nos faltaría construir. Sí. Va a poder desactivar los proveedores, va a poder reactivarlos, todo.

Ok, ok. Ahora, acá, esto varía un poco en la de bobina servilleta. Primero va a ver el código de la unidad 1. Y aquí ya viene el formato precargado.

Ya. Por ejemplo, va a tener que ingresar el formato de la que es 435 x 3. Ya. Eso va a tener que ingresarlo.

Y también el otro, que sería de 435 x 2 más una de 220. Ya, ok. Eso va a tener que agregarlo con un poco de cuidado.

Ya. Para que no varíe. Porque como son cantidades distintas, el sistema automáticamente, al abrir una bobina, va a liberar automáticamente la cantidad que tiene.

En este caso, por ejemplo, al abrir, digamos, una bobina, va a liberar 3 de 435 en el inventario. Exacto. Y, bueno, va a liberar 5 de 435 y una de 220.

Ya, perfecto. Pero, como está en la ficha igual, los dos códigos tienen que respetarse totalmente. Sí.

A qué formato pertenece cada uno. Ya, ok. Eso nunca va a variar, ¿no?, lo de las servilletas.

No, no. Ah, ya. Nunca van a cambiar de proveedor, ni nada.

Podría cambiar de proveedor, pero básicamente siempre manejan los mismos, las mismas dimensiones de las servilletas. Ah, ya. Lo que pasa con esto, o sea, para que entiendas más o menos cómo es que funciona.

La bobina está entera. Por eso tiene un solo código. Y lo que ellos hacen es cortar la bobina a nuestras medidas, que es ese 435, 220.

Ah, ya. Y siempre van a pedir lo mismo. Exacto.

Si fuera otro proveedor, de todas maneras, ellos van a tener una bobina entera y la van a cortar según nosotros pidamos. Ah, perfecto entonces. Entonces, en eso no va a haber problemas, ¿verdad? Aunque cambien de proveedor, siempre se va a meter 435 por 3. Exacto.

Ah, ya, ya. Está bien. Solo por si acaso, ¿no? Sí.

El peso bruto, todo eso, igualmente va a poder ingresar varias como de la ficha y lo va a guardar el lote igualmente. Ya, ok. En eso no va a haber problemas.

Igual, por si digamos en el código hubiese espacio, digamos, es ASD1, digamos. Sí. Siempre que pongo un espacio, se va a agregar un guioncito para que no haya espacios en el campo y directamente se puede identificar, por ejemplo, así, digamos.

Ah, ok. Todas esas características igual he ido viendo. Ok.

Ya. Ahora sí, vamos al área de reportes. Igualmente, va a haber reportes de producción e inventario.

Aquí en el inventario se va a poder sacar la trazabilidad completa de una bobina. Ya. ¿Cómo se va a buscar la bobina? Por su código, por su tipo, por el proveedor, por todos estos filtros de búsqueda que tiene acá.

Ya. Por ejemplo, vamos a buscar de económico qué bobinas tenemos. Ahorita tenemos solo una en almacén y aquí, en este botoncito aquí que dice descargar historial de movimientos de esta bobina, lo descargamos.

¿Qué es lo que nos va a mostrar este reporte? Este reporte nos va a mostrar si ha entrado a producción, de qué producción ha salido, si ha estado fuera de inventario. Todos esos campos nos lo va a mostrar. A ver, vamos con una bobina que ya ha tenido más movimientos.

A ver, a ver, a ver, por ejemplo, este que está agotado, que ya es cuando se filaniza una producción, automáticamente la bobina, su estado cambia a agotado. Ya, ok. Ahora si mire, por ejemplo, primero, está compuesto así el reporte.

Historial de movimientos de bobina, papel, bla, bla, bla, bobina, su código, a qué tipo pertenece, generado por, este es el usuario, bueno, este es un usuario de ejemplo, pero ahí va a salir el primer nombre y el primer apellido. Ya, ok. El carnet de quien lo ha hecho y su rol.

Ya, ok. Estado actual, agotado de la bobina, cantidad de movimientos y la fecha de la generación, que ha sido generado el 6 de octubre del 2026 a las 10 con 13 minutos. Sí, correcto.

¿Está correcto todo eso? Sí, sí. Ya, ahora, acá, mire, por ejemplo, va a salir, 0 del 4, el 4 de agosto ha entrado inventario, ha entrado al almacén, registrado por el operador, digamos, ejemplo de usuario, carnet y su rol, todo apilado en esa, en esa piscina. Y la observación que ha puesto el operador, el ingreso.

Sí. Luego, a las, el mismo día, a las 3 de la tarde, lo ha trasladado a producción. Correcto.

El usuario, lo habla, y luego el 10 del 09, por ejemplo, el 10 de septiembre, ha terminado la producción. ¿Por quién? Por otro usuario mide, este es, mire, los carnet varían. Aunque le he puesto los mismos nombres de prueba, este es el 42, este es el 43, y tienen roles distintos, son entre los dos usuarios que he ido alternando.

Ok. Se va a poder sacar esa trazabilidad completa de cada bobina. Ya, perfecto.

Está bien, ¿verdad? Sí, la tiene, sí. Y ahí va a salir producción terminada, bobina, tubo, 3, vale, 0. Ok. Y listo, ahí queda.

Ok, perfecto. Luego de eso, por ejemplo, esta que está fuera de inventario, podemos ver todos sus movimientos. Ya.

Por si se requisiese, por ejemplo, aquí vamos a ver, ingreso al almacén, traslado a producción, retiro por falla operativa, por ejemplo. Ya, ok. Y luego se puede ver si se ha reingresado, etc.

Ajá, perfecto. Todos los movimientos se va a saber. Ya, perfecto.

Toda esa trazabilidad va a existir de las bobinas, por lo menos. Sí. El pallet no tiene tantas fallas, ¿no? No.

No llega a tener, directamente se abre y pasa. Ajá, correcto. Exacto, el pallet no va a tener, por ejemplo, esa trazabilidad, pero las bobinas de papel, de servilleta, tienen esa trazabilidad.

Ya, perfecto. Ahora, aquí mismo, en esta pestaña de acá, va a tener todos los lotes igualmente. Ya.

Todos los lotes que se vayan registrando. Por ejemplo, aquí, estos de cero eran pruebas que he hecho para validar que no se puede ingresar cero, por eso están acá. Pero este que tiene 12, por ejemplo, vamos a ingresarlo, podemos, digamos, y aquí está, igualmente que en el anterior, el proveedor, la fecha de recepción, cantidad de bobinas, registrado por el CI y el rol.

Ya, ok. Aquí sale, obviamente, el generado, tantos, tantos. Sí.

Y aquí, bobinas por lote, por ejemplo. Ya, ok. Aquí va a estar el código de las bobinas, el tipo, peso bruto, peso neto, gramaje.

Ya, ok. Toda esa información se va a poder tener seguimiento. Ahora, si, digamos, a quien, por ejemplo, quisiera filtrar por proveedor, va a salir por proveedor.

Ya. También, si quisiera filtrar en un rango de fechas, todas las bobinas, va a tener, digamos, a ver, aquí he hecho más ingresos. Digamos, entre, mire, y aquí esto es lo chala, le va a marcar las fechas con amarillito.

Sí. Qué fechas ha habido ingresos. Ya, correcto.

¿Está bien? Sí, sí, sí. Y ahí le va a mostrar, mire, el lote 6, 3 de septiembre. Ah, ya, ya, ya, ok.

Todas esas cosas le vaya mostrando. Ya, perfecto, perfecto. Siempre que se tenga seguimiento en el sistema.

Sí. Todo eso siempre tiene que hacerse seguimiento. Una vez que hay un ingreso, tiene que pasarse al sistema.

Ya. Por ejemplo, digamos, si pasarían a producción una que recién ha ingresado, ahí quedaría un hueco, por ejemplo. Exacto.

Ya, perfecto. Así que siempre que haya un ingreso de materia prima, tiene que registrarse al sistema. Todo.

Sí. Porque, digamos, ese mismo día se pasa a producción una que ha llegado. Sí.

Ahí quedaría un hueco gigante de la producción. Ya, lo entiendo. Bueno, y así sería, básicamente, el reporte de bobina a papel.

Bobina a servilleta igual cumple las mismas funciones. Mismos filtros, proveedor, estado. Ah, y esto de los estados, igual está acá.

Por ejemplo, puede igual buscar por estado, estado en almacén. Si está en producción, igual puede obtenerlo. Agotado, dado de baja.

Fuera de inventario, abierta, terminada. Esto de abierta y terminada va más para la bobina de servilleta porque se abre, ¿verdad? Sí. Y cuando se acaba todo, se termina.

Eso lo voy a quitar nada más, no se preocupe. Aquí. Ya, ahora sí.

Acá, por ejemplo, igual se puede buscar por todos los estados, proveedor. Miren, aquí está de las bobinas individualmente de la unidad. Sí.

Podemos sacar igual, por ejemplo, estas que están abiertas, por ejemplo. Vamos a sacar un reporte de esta. Y podemos, aquí básicamente, podemos extraer los movimientos de sus subbobinas.

Ya. Si han pasado a producción, el ingreso al almacén, el traslado a producción. Todas esas cosas podemos saberlas desde las subbobinas.

Ya, ok. Sabiendo sólo de la bobina raíz que ha habido, de servilletas, ya podemos saber los movimientos de subsecuentes de las demás bobinas. Ah, ya, ok, entiendo.

Mire, por ejemplo, a ver, aquí está. Apertura de bobina para producción, apertura de bobina para producción, traslado a producción, producción terminada de su subbobina número 9, por ejemplo. Sí.

El formato, los formatos igual varían, por ejemplo, acá. Aquí está el otro formato de 220. Ah, ya, correcto.

Todas esas cosas se puede hacer seguimiento igualmente con las bobinas de servilleta. Ya, perfecto. Desde saber de su recepción, la apertura y el mismo seguimiento de sus subbobinas.

Sí. Todo eso se lo puede saber. Ok.

¿Está bien? Sí. Ya. Y aquí está, por ejemplo, si quisiera saber lo que varía entre bobina, papel y la otra, es que aquí, por ejemplo, de una unidad, me refiero de una subbobina, saber igual todo su seguimiento.

Ya. Todo igualmente se puede hacer acá. Igualmente, como en el otro, los lotes igualmente se puede hacer.

Ah, ya. Y replica la función. Claro.

Bueno, ahí está. Va a tardar un poquito en cargar, pero ahí está. Sale igual el ingreso de lotes, todo.

Ya, perfecto. Y se puede ver igualmente entre rangos de fechas, por ejemplo. Si quisiera ver una fecha específica, solo hace clic una vez.

Pero si quisiera ver un rango completo, lo selecciona así. Ah, ya, ya. Ok.

Esta parte es más que todo para la parte del celular y todo eso. Buen día para la computadora. Porque es un panel un poquito más amplio.

Igual no le he puesto la barra porque no creo que saque muchos reportes en su celular, ¿no? No, no, no. Sí, directamente para el uso en la computadora va a estar. Ya, perfecto.

Luego, aquí viene la otra parte. Pasamos a la de rodela, que es igualmente lo mismo. Una rodela tiene un ingreso, traslado producción y ahí se acaba, ¿no? Sí, sí.

Igual se puede tener el seguimiento y todo eso. Ya, ok. Tanto como del inventario como de los ingresos.

Ok. Y la misma funcionalidad se replica igualmente. Ya, perfecto.

Ahorita va a cargar. Pero creo que no. Bueno, debería salir ahí porque está.

Eso lo voy a corregir luego. Pero todo eso va a salir. Ya, ok.

Ahora, productos. Igual se va a ver el stock por líneas. Por ejemplo, ahorita este es el stock actual, ¿verdad? Ya.

Se puede sacar un informe. Ok. Y para que los reportes igual no varíen, está el generado por, las fechas, todo eso.

Por ejemplo, ahorita podemos descargar un informe de todito el inventario, por ejemplo. Ya. Y, a ver.

Ahí está. Por ejemplo, mire. Va a salir el resumen por línea.

Luxury tiene 380 javas, tanto. Pero aquí ya, individualmente por producto. Digamos, Luxury 6, con su codiguito, contenedor java, contenido 8 paquetes.

Tiene 130, por ejemplo. Último movimiento. Y va a generar el último movimiento que se ha hecho.

Ya, ok. Sobre cada línea. Claro.

Para hacer, igual, mantener la trazabilidad del sistema. Sí, sí. Igual con Ecopack, servilletas, megarrollo económico, va a sacar el completo.

Ok. Si quisiera individualmente, selecciona solo Luxury y descarga el informe. Ah, ya, ya.

O si quisiera solo Luxury, Ecopack, descarga el informe. Ah, ok. Si quisiera los 3, los 3. Y así mismo con cualquiera.

Si digamos, repite, solo de Ecopack, Ecopack. Exacto. Ya, perfecto.

Ya. Ahora, los códigos QR. Acá usted va a tener el acceso para poder imprimir directamente.

Cuando esté conectado a la impresora, lo va a imprimir directamente. Ya, ok. O descargarlo como PDF.

Sí. Una de las dos opciones. Ahora, esto es lo más interesante.

A ver, si ya cargó la aplicación. Voy un poquito lentito hasta la entrada de todo. Voy a intentarlo de otra manera.

Esperamos un momento a que cargue. Porque ahorita el escáner de QR ya funciona. Ya.

Esperemos un momentito a que cargue, por favor. O si no, podemos intentarlo desde su celular. A ver, le voy a mandar la aplicación, la URL.

Listo, ya se la mandé. Ingrese desde el navegador y voy a iniciar sesión. Ok.

Ah, bueno, ya cargó mi celular. Ahora sí, chequeé esta cosita. Vámonos de vuelta a la aplicación.

Simulemos, digamos, que usted ya ha puesto el cartel para dirigirse al inventario rápidamente a bobina papel, por ejemplo. Digamos, ahí está el QR en la pared. Sí.

Quiero que esta velocidad de escaneo, mire. Directamente lo pone. Ya, ya, ya, ya.

Y se va a dirigir a la pared. Ah, correcto. Ah, ya, ya.

Solo que, mire, ya cambió, inventario de bobina papel y ahora automáticamente ya puede irse al inventario, hacer lo que necesita. Ya, perfecto. Lo que más va a facilitar esto va a ser en la producción, por lo menos al moverse en producción.

Sí. Por ejemplo, digamos, no quiere perder tiempo en el sistema cambiando opciones. Exacto.

Va directamente y se va a pasar a la producción de bobina de papel. Sí, sí, sí, sí, sí. Y ahí ya puede ingresar los logs, terminarlo, etc.

Sí, correcto. Ya, perfecto. Ahora, acá las únicas vistas que va a haber para bobina de papel son inventario y producción.

Ya. Como lo de los lotes no es tan frecuente, directamente le ingresa a la aplicación y ya con más calma. Ya.

Ok. La bobina servilleta igual, inventario y producción. Ya, ok.

Todo para hacer seguimiento. Si facilita igual hacerlo a mano, todo a mano. Sí.

Producto terminado al inventario y me faltaría hacer para los movimientos. Ya, ok. Pero todo va a funcionar bajo la misma lógica.

Sí. Va a pegar y va a decir inventario de producto terminado. Sí.

Ya directamente ella selecciona las líneas, hace todo. Pero la cosa es que... Se va a ir adivinando. Exacto.

Y con los empaques va a ser más útil. Como van a ir rotando en distintas áreas, va a ir al área de un empaque, va a sacar una forma, va a escanearlo y va a poder descontar cuántas necesite el inventario. Ya, perfecto.

Está bien, ¿verdad? Sí. Ya. Luego, acá en esta parte de los reportes que cambia un poco la ruta.

Si quiere volver a la aplicación inicial, aquí hay una opción que dice volver a la planta. Va a alternar entre ambas opciones. Ya.

Ah, ya, ya. Aquí en la vista de inicio está una de pre-default que he hecho de operador solamente, pero ahorita ya dice encargado. Aquí siempre, dependiendo del rol, cambia la ruta inclusive.

¿Qué va a necesitar aquí en el inicio por lo menos? ¿O qué necesitaría alguien en cargo del inventario? A ver, lo pondré por acá en una lista para ver. Seguramente va a ser algún acceso rápido así, ¿no? Ah, ya, para ver la producción diaria. Algo así, ¿verdad? Sí, eso vaya viéndolo.

Ya tiene la URL. Le voy a crear un usuario, le voy a mandar un usuario y va a estar viendo el sistema, vaya evaluando las cositas, vaya viéndolo todo. Si quiere inicie producciones, cancele las.

Ah, ya, ya, ok. Va, puede irlo viendo toda esa parte del sistema. Le voy a crear un usuario y se lo voy a pasar.

Ok, ok. Pero de momento así está yendo el sistema. Sí.

¿Qué tal lo ve? Bien, bien, bien, bien. Porque hay varias cosas que se han presentado ahora y que con esto se simplifica bastante. Ah, está bien entonces.

Sí. Sí, la interfaz, ¿qué tal lo ve? Bien, bien intuitivo. No me parece complicado.

Sí, he tratado de hacerlo lo más intuitivo. Por lo menos igual como van a tener computador y celular aquí, por lo menos puede igual moverse entre inventario, producción, todo. Ajá, exacto.

Sólo que mi internet está un poco lenta y no está yendo tan rápido. No, está súper bien la verdad. Y así básicamente le va a facilitar todo.

Luego, la pequeña característica que te voy a agregar es que cuando abra, digamos, el inventario de higiénico, la dirija allá abajo en lugar de tener... Ah, ya, ya. Sí, esas cosas voy a ir viendo yo, pero luego cualquier observación que tenga, dígamela nomás. Ya.

Y yo la voy a cumplir. Esta página es totalmente de prueba, se puede decir. Ok.

Pero para un encargado, digamos, que usted necesita producción diaria y esas cosas, para la vista inicial, lo voy a estar. Ya. Ahora, para el panel de don Osvaldo igual, quería saber qué se necesitaría, por lo menos para estas áreas que estamos comprendiendo.

Sí, seguramente lo que más debe importar, porque él no sé si va a haber algo de producción como tal. Seguramente se va a ir a lo final, ya sea inventario y cuánto hay en inventario o cuántos productos tenemos. Ah, ya, ya.

Entonces lo que sería más útil para él sería directamente ver pausas. Sí, sí. Y productos, cuántos hay, digamos.

Ah, ya, ya. Producción mensual, esas cosas. Algo así.

Ah, ya, ya. Esas cosas él va a necesitar, por ejemplo, ¿no? Sí. No va a necesitar más allá, por ejemplo, esto de toda la trazabilidad de eso.

No, no, no, no. A él lo que le va a importar va a ser cantidades. Ah, ya, ya, ya.

Está bien entonces. No es mucha información, ¿no? No, no, no, no. Se va a ir como a los resúmenes de todo, a ver cuánto hay de esto, de esto, ya.

Ah, ya, perfecto, perfecto. Ya, bueno, así estaría el sistema, Carlos. No sé qué tal le está pareciendo.

Sí, sí, sí. Cumple todo con... Sí, exacto, exacto. Ah, ya, ya, perfecto.

Lo voy a revisar de todas maneras y anotar cualquier otra duda que tenga o detalle que tenga que informarte por... Ya, sí, yo creo que con eso sí ya estaríamos... Ah, también quería preguntarle, tengo algunas dudas. Sí. A ver, el sistema en algún momento va a necesitar... ¿Ustedes van a crear un nuevo producto? ¿Eventualmente va a suceder? Sí, sí, es muy probable.

Es muy probable que sí. Ya, eso lo voy a agregar en un panel de administración igualmente. Ah, ya, ya, ya, ok.

Y también, ¿el sistema va a poder crear nuevas líneas, por ejemplo? Un, digamos, aparte de Copacto, creo que ya existe, crear otra línea igualmente. Sí, sí. ¿Va a suceder? Es también muy probable, sí, correcto.

Ah, ya, ya, ya. También, no sé si tuviese un mapita de la planta o algo. ¿Un layout? Sí.

Ya, creo que lo tengo abajo. Ah, ya, por favor, sí. Una foto, por lo menos, y yo lo paso a mi documento directamente.

Ya. Entonces, ¿sí van a crear productos? Sí, es lo más probable. Respecto a los insumos igualmente, tanto como el pegamento, la maicena, las serchas, eso igual va a necesitar una descripción de cada uno que usan.

Ya, exacto. Y con eso ya, como se ha podido ver, igual no le he mostrado los insumos porque todavía no tengo la información correcta. Ok, ok, que sería básicamente igual que lo otro, ¿verdad? Solamente un conteo.

Sí, que se vaya descontando y va a haber un movimiento que va siguiendo todo eso. Pero sí, se mantiene igual que lo otro. Ok, ok.

Ah, ya, entonces sí se van a crear nuevas líneas, nuevos productos eventualmente. Sí. Pero la materia prima no va a cambiar.

No se va a necesitar agregar nueva materia prima, por ejemplo. Todo va a ser con bobinas, todo normal. Todo va a ser bajo la misma lógica que ahora estamos manejando.

Pero, por ejemplo, ha pasado algo. Los vecinos mandaron una muestra, ya, de un papel de servilletas. Ahora, estas servilletas no son de celulosa virgen.

Sí. Nos han mandado una mezcla, ya. Ahora le mandamos esa información a Osvaldo y él la ha visto.

Ah, me parece bien. Posiblemente podamos sacar otra línea, dice. No es seguro, pero puede darse.

Ahora, la bobina es la misma, que es lo que cambia el tipo. No es celulosa, es mezcla. Ah, ya, ya, ya.

Entonces, igualmente se pueden agregar nuevos tipos dentro del sistema. Exacto. Ah, ya, eso igual lo voy a tener a consideración, entonces.

Ah, ya, entonces se pueden agregar nuevos productos, nuevas líneas. Exacto. Un producto que pertenezca a una línea ya existente, igualmente se puede agregar.

Sí. Ya. Y también se pueden agregar nuevos tipos de materia prima.

Sí, correcto. Perfecto. Que va igual ligado a lo que es, por ejemplo, la bobina.

Si es que necesitamos sacar una nueva línea de papel higiénico, ¿verdad? Sí. También, por ende, se va a aumentar lo que es una bobina, ¿verdad? Del empaque. Ah, ya, ya.

O sea, el mismo producto se puede alterar su cantidad. Exacto. ¿Pero las jabas van a cambiar? ¿Pueden cambiar la cantidad de las jabas? Podría cambiar, pero por decirte, sacar un ecopack 8 rollos.

Entonces, ese ecopack 8 rollos además va a necesitar su propia bobina, ¿verdad? Su propio empaque. Ah, ya, ya, ya. Y van a agregar una nueva, un nuevo empaque.

Exacto. Ah, ya, ya, ya. Se pueden agregar igualmente nuevos empaques.

Exacto. Ya. Sí, creo que eso sería más que todo.

Todas las dudas que tenía, pero ya está bien. Podríamos sacar fotos a los registros, todos los registros de inventario. La layout de la planta igualmente voy a necesitarlo.

Ya. Las fichas de cada materia prima. Sí.

De las bobinas en rollo igualmente. Ya, ok. Vamos, vamos a verlo eso.

Ok.







Entonces este PK-02 es el número de papel craft, significa? Papel craft, el número de pedido en el que han llegado, este es el segundo de este año Si llega uno más, este ya sería papel craft 03, verdad? Y luego de este 03 va a llegar un pallet 1, un pallet 2, un pallet 3 Por eso lo registran nomas, en el sistema no hubiese problema Exacto, porque es lo mismo, por ejemplo este es el papel craft 02 que ha llegado en el segundo pedido El número 17, entonces hay un 13, 14, 15, hay un 1 Ah, perfecto, perfecto, está bien entonces Y así toda esa información por favor la voy a requerir al instante casi ya Ya, ok El layout igual no se olvide por favor Ya, ok Y ya con eso ya estaría igual la descripción del pegamento, todo lo que usan, la maicena igual, eso lo voy a necesitar Ya Y con eso ya podría proseguir con lo de insumos, todo eso Por ejemplo el pegamento directamente sale del metal, no? No hay mucho seguimiento para ello No, por ejemplo de este tanque pueden llegar dos tanques, verdad? Si, entonces un tanque está consumiendo, verdad? Y el siguiente va a entrar cuando este se acabe y demás No suele llegar mucho, suelen ser dos tanques, tres puede ser como más Ah ya, perfecto, perfecto Si creo que con eso ya cumple todo, verdad? Si Y esa información sería la última que requiriera sobre los empaques, insumos, todo Ya, ok Por eso ya se concluye Ok, ok Fabrizio, ok Ok Fabrizio, te mando entonces esa información Bueno está bien Carlos, yo voy a avanzar en ese panel igual, en el panel administrativo Y ya con eso ya casi tendríamos concluido este módulo del sistema por lo menos Ya, ok, ok Fabrizio Me avisas cualquier otra información que necesites, aquí he anotado lo que ahora me estás pidiendo Si Voy a pedir esta información a los que están agarrando estos documentos y te la voy a compartir Ya, está bien Ok Con eso ya sería suficiente y ya igual podríamos avanzar en el documento y con eso ya tendríamos toda esta parte concluida Ya, ya, ya Fabrizio

