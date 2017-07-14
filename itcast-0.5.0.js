( function ( global ){
  var document = global.document,
      arr = [],
      push = arr.push,
      slice = arr.slice;

  function itcast ( selector ){
    return new itcast.fn.init( selector );
  }

  itcast.fn = itcast.prototype = {
    constructor: itcast,
    length: 0,   // 由于itcast对象是伪数组对象，默认length属性值为 0
    toArray: function (){
      return slice.call( this );
    },
    get: function ( index ){
      if ( index == null ){
        return this.toArray();
      }

      return this[ index < 0 ? this.length + index : index ];
    },
    eq: function ( index ){
      return itcast( this[ index < 0 ? this.length + index : index ] );
    },
    first: function () {
      return this.eq( 0 );
    },
    last: function () {
      return this.eq( -1 );
    },
    each: function ( callback ){
      itcast.each( this, callback );
      return this;
    },
    splice: arr.splice
  };

  var init = itcast.fn.init = function ( selector ){
    if ( !selector ){
      return this;
    } else if ( itcast.isString( selector ) ){
      if ( itcast.isHTML( selector ) ){
        push.apply( this, itcast.parseHTML( selector ) );
      } else {
        push.apply( this, document.querySelectorAll( selector ) );
      }
    } else if ( itcast.isDOM( selector ) ) {
      this[ 0 ] = selector;
      this.length = 1;
    } else if ( itcast.isArrayLike( selector ) ){
      push.apply( this, selector );
    } else if ( itcast.isFunction( selector ) ){
      document.addEventListener( 'DOMContentLoaded', function (){
        selector();
      } );
    }
  };

  init.prototype = itcast.fn;

  itcast.extend = itcast.fn.extend = function (){
    var args = arguments,
        i = 0,
        l = args.length,
        obj,
        k,
        target = this; // 默认给this扩展
    // 如果传入参数的个数 大于 1，给第一个参数扩展成员
    if ( l > 1 ) {
      target = args[ 0 ] || {};
      i = 1;
    }

    for ( ; i < l; i++ ){
      obj = args[ i ];
      for ( k in obj ){
        if ( obj.hasOwnProperty( k ) ){
          target[ k ] = obj[ k ];
        }
      }
    }

    return target;
  };

  itcast.extend( {
    each: function ( obj, callback ){
      var i = 0,
          l;
      // 1 如果obj为数组或伪数组
      if ( itcast.isArrayLike( obj ) ){
        l = obj.length;
        // 使用for循环遍历数组或伪数组
        for ( ; i < l; i++ ){
          // 执行指定的回调函数callback，改变内this值为 当前遍历到的元素，同时传入 i 和 obj[ i ]
          // 判断回调函数callback的返回值，如果为false结束循环
          if ( callback.call(obj[ i ], i, obj[ i ] ) === false ){
            break;
          }
        }
      // 2 如果obj是普通对象
      } else {
        for ( i in obj ){
          if ( callback.call(obj[ i ], i, obj[ i ] ) === false ){
            break;
          }
        }
      }

      return obj;
    },
    type: function ( obj ){
      if ( obj == null ){
        return obj + '';
      }

      return typeof obj !== 'object' ? typeof obj :
          Object.prototype.toString.call( obj ).slice( 8, -1 ).toLowerCase();
    },
    parseHTML: function ( html ){
      var div = document.createElement( 'div' ),
          node,
          ret = [];

      div.innerHTML = html;

      for( node = div.firstChild; node; node = node.nextSibling ){
        if ( node.nodeType === 1 ){
          ret.push( node );
        }
      }

      return ret;
    },
    unique: function ( arr ) {
      // 去重后的新数组
      var ret = [];
      // 遍历原数组arr
      itcast.each( arr, function () {
        // 如果indexOf返回值 为 -1，表示ret不含有当前元素
        if ( ret.indexOf( this ) === -1 ) {
          // 那么就添加到ret内
          ret.push( this );
        }
      } );
      // 返回结果
      return ret;
    }
  } );

  itcast.extend( {
    isString: function ( obj ){
      return typeof obj === 'string';
    },
    isHTML: function ( obj ){
      obj = obj + '';
      return obj[ 0 ] === '<' && obj[ obj.length - 1 ] === '>' && obj.length >= 3;
    },
    isDOM: function ( obj ){
      return !!obj && !!obj.nodeType;
    },
    isArrayLike: function ( obj ){
      var length = !!obj && 'length' in obj && obj.length,
          type = itcast.type( obj );

      if ( type === 'function' || itcast.isWindow( obj ) ){
        return false;
      }

      return type === 'array' || length === 0 || 
          typeof length === 'number' && length > 0 && ( length - 1 ) in obj;
    },
    isFunction: function ( obj ){
      return typeof obj === 'function';
    },
    isWindow: function ( obj ){
      return !!obj && obj.window === obj;
    }
  } );

  // DOM操作模块
  itcast.fn.extend( {
    appendTo: function ( target ) {
      var that = this; // 缓存this引用的对象 
      var ret = [],    // 存储所有分配出去的节点
          node;        // 临时存储要被分配的节点
      // 1: 统一target类型。为itcast对象
      target = itcast( target );
      // 2: 遍历target
      target.each( function (i, elem ){
      // 3: 遍历itcast对象-appendTo方法的调用者
        that.each( function (){
          // 如果遍历到的是第一目标DOM元素，不需要拷贝node源节点；否则，就需要拷贝node
                // 同时要拷贝其后代节点，因此要使用深拷贝的方式
          // 然后给目标元素追加上述得到新节点
          // this -> 遍历that 得到的当前元素
          node = i === 0 ? this : this.cloneNode( true );
          ret.push( node );
          elem.appendChild( node );
        } );
      } );
      // 4：实现链式编程
      return itcast( ret );
    },
    append: function ( source ) {
      source = itcast( source );
      source.appendTo( this );
      return this;
    },
    prependTo: function ( target ){
      var ret = [],
          that = this,
          node,
          firstChild; // 存储目标元素的第一个子节点

      target = itcast( target );
      target.each( function ( i, elem ) {
        // 获取当前目标元素第一个子节点
        firstChild = elem.firstChild;
        that.each( function (){
          node = i === 0 ? this : this.cloneNode( true );
          ret.push( node );
          // 将得到的新节点，在firstChild前边给elem添加子节点
          elem.insertBefore( node, firstChild );
        } );
      } );

      return itcast( ret );
    },
    prepend: function ( source ) {
      source = itcast( source );
      source.prependTo( this );
      return this;
    },
    next: function () {
      var ret = [];
      this.each( function ( i, elem ) {
        // var node = elem.nextSibling;
        // while ( node ) {
        //   if( node.nodeType === 1 ){
        //     ret.push( node );
        //     break;
        //   }
        //   node = node.nextSibling;
        // }
        while ( ( elem = elem.nextSibling ) && elem.nodeType !== 1 ){}
        if ( elem != null ) {
          ret.push( elem );
        }
      } );
      return itcast( ret );
    },
    nextAll: function () {
      var ret = [];
      this.each( function ( i, elem ) {
        var node = elem.nextSibling;
        while ( node ) {
          if( node.nodeType === 1 ){
            ret.push( node );
          }
          node = node.nextSibling;
        }
      } );
      return itcast( itcast.unique( ret ) );
    },
    remove: function () {
      return this.each( function () {
        this.parentNode.removeChild( this );
      } );
    },
    empty: function () {
      return this.each( function () {
        this.innerHTML = '';
      } );
    },
    before: function ( node ) {
      return this.each( function ( i, elem ) {
        // 如果是字符串类型，就创建一个文本节点
        node = itcast( itcast.isString( node ) ? document.createTextNode( node ) : node );
        // if ( itcast.isString( node) ) {
        //   node = itcast( document.createTextNode( node ) );
        // } else {
        //   node = itcast( node );
        // }
        node.each( function ( j, cur ) {
          elem.parentNode.insertBefore( i === 0 ? cur : cur.cloneNode( true ), elem );
        } );
      } );
    },
    after: function ( node ) {
      return this.each( function ( i, elem ) {
        var nextSibling = elem.nextSibling;
        node = itcast( itcast.isString( node ) ? document.createTextNode( node ) : node );
        node.each( function ( j, cur ) {
          elem.parentNode.insertBefore( i === 0 ? cur : cur.cloneNode( true ), nextSibling );
        } );
      } );
    }
  } );

  // 属性模块
  itcast.propFix = {
    'class': 'className',
    'for': 'htmlFor'
  };
  itcast.each( [
    "tabIndex",
    "readOnly",
    "maxLength",
    "cellSpacing",
    "cellPadding",
    "rowSpan",
    "colSpan",
    "useMap",
    "frameBorder",
    "contentEditable"
  ], function() {
    	itcast.propFix[ this.toLowerCase() ] = this;
  } );
  itcast.fn.extend( {
    attr: function ( name, value ) {
      // 1: 如果value = undefined
      if ( value == undefined ) {
        // 并且 name 类型 为 对象
        if ( typeof name === 'object' ) {
          this.each( function ( i, elem ) {
            for ( var k in name ) {
              elem.setAttribute( k, name[ k ] );
            }
          } );
        // name 类型 为 字符串
        } else {
          return this.length === 0 ? undefined : this[ 0 ].getAttribute( name );
        }
      // 如果value值不为undefined
      } else {
        this.each( function () {
          this.setAttribute( name, value );
        } );
      }
      // 实现链式编程
      return this;
    },
    prop: function ( name, value ) {
      var propName;
      if ( value == undefined ) {
        if ( typeof name === 'object' ){
          this.each( function ( i, elem ) {
            for ( var k in name ) {
              propName = propFix[ k ] || k;
              elem[ propName ] = name [ k ];
            }
          } );
        } else {
          propName = propFix[ name ] || name;
          return this.length === 0 ? undefined : this[ 0 ][ propName ];
        }
      } else {
        this.each( function () {
          propName = propFix[ name ] || name;
          this[ propName ] = value;
        } );
      }

      return this;
    },
    val: function ( value ) {
      if ( value == undefined ) {
        return this.length === 0 ? undefined : this[ 0 ].value;
      } else {
        return this.each( function () {
          this.value = value;
        } );
      }
    },
    html: function ( html ) {
      if ( html == undefined ) {
        return this.length === 0 ? undefined : this[ 0 ].innerHTML;
      } else {
        return this.each( function ( i, elem ) {
          elem.innerHTML = html;
        } );
      }
    },
    text: function ( txt ) {
      if ( txt == undefined ) {
        return this.length === 0 ? '' : this[ 0 ].textContent;
      } else {
         return this.each( function ( i, elem ) {
          elem.textContent = txt;
        } );
      }
    }
  } );

  // 样式模块
  itcast.fn.extend( {
    hasClass: function ( className ) {
      // 定义该方法的返回值。默认为false
      var ret = false;
      // 遍历itcast对象上所有DOM元素
      this.each( function () {
        // 如果该DOM元素含有指定的样式类
       if ( this.classList.contains( className ) ) {
        //  返回结果为 true，并结束循环
         ret = true;
         return false;
       }
      } );

      return ret;
    },
    addClass: function ( className ) {
      return this.each( function ( i, elem ) {
        if ( !itcast( elem ).hasClass( className ) ){
          elem.classList.add( className );
        }
      } );
    },
    css: function ( name, value ) {
      // 1 value是否为 undefined
      if ( value == undefined ){
        // 如果name类型为 对象
        if ( typeof name === 'object' ) {
          this.each( function ( i, elem ) {
            for ( var k in name ) {
              ( elem.nodeType === 1 ) && ( elem.style[ k ] = name[ k ] );
            }
          } );
        // 如果name类型为 字符串
        } else {
          return this.length === 0 ? undefined : global.getComputedStyle( this[ 0 ] )[ name ];
        }
      // 2: value值不为undefined
      } else {
        this.each( function () {
          this.style[ name ] = value;
        } );
      }
      // 3: 实现链式编程
      return this;
    },
    removeClass: function ( className ) {
      return this.each( function () {
        className == undefined ? this.className = '' : this.classList.remove( className );
      } );
    },
    toggleClass: function ( className ) {
      return this.each( function () {
        // 1: 使用封装好的方法
        // var $this = itcast( this );
        // if ( $this.hasClass( className ) ) {
        //   $this.removeClass( className );
        // } else {
        //   $this.addClass( className );
        // }
        // 2: 自己实现
        if ( this.classList.contains( className ) ) {
          this.classList.remove( className );
        } else {
          this.classList.add( className );
        }
      } );
    }
  } );

  // 事件模块
  itcast.fn.extend( {
    on: function ( type, callback ) {
      return this.each( function () {
        this.addEventListener( type, callback );
      } );
    },
    off: function ( type, callback ) {
      return this.each( function () {
        this.removeEventListener( type, callback );
      } );
    }
  } );

  itcast.each( ( 'click dblclick keydown keypress mouseover mouseout mouseenter mouseleave mousemove' +
   ' mousedown mouseup keyup focus blur load' ).split( ' ' ), function ( i, type ) {
    //  this->数组元素
    itcast.fn[ type ] = function ( callback ) {
      return this.on( type, callback );
    };
   } );

  // Ajax模块
  function createRequest() {
    return window.XMLHttpRequest ? 
      new window.XMLHttpRequest() : 
      new window.ActiveXObject( 'XMLHTTP' );
  }

  function formatData( data ) {
    var k,
        ret = [];

    for( k in data ) {
      ret.push( window.encodeURIComponent( k ) + '=' + window.encodeURIComponent( data[ k ] ) );
    }
    return ret.join( '&' );
  }

  itcast.extend( {
    ajaxSettings: {
      url: '',
      type: 'get',
      data: {},
      dataType: 'json',
      success: null,
      fail: null,
      async: true,
      contentType: 'application/x-www-form-urlencoded'
    },
    ajax: function ( config ) {
      // 过滤无效值
      if ( !config || !config.url ) {
        return;
      }
      var context = {}; // 用户的配置信息
      // 将用户和默认的配置合并成一个新的对象来存储
      itcast.extend( context, itcast.ajaxSettings, config );
      // 1:
      var xhr = createRequest(),
          postData; // post的数据
      // 2:
      postData = formatData( context.data );

      if ( context.type.toLowerCase() === 'get' ) {
        context.url += '?' + postData;
        postData = null
      }      

      // 3: 
      xhr.open( context.type.toLowerCase(), context.url, context.async );
       // 先调用open方法，在设置请求头
      ( context.type.toLowerCase() === 'post' ) && ( xhr.setRequestHeader( 'Content-Type', context.contentType ) )
      // 4:
      xhr.onreadystatechange = function ( ) {
        var readyState = xhr.readyState,
            status = xhr.status;

        if ( readyState === 4 ) {
          if ( status >= 200 && status < 300 || status === 304 ) {
            // 根据用户配置的数据类型，做转换
            var data = context.dataType.toLowerCase() === 'json' ?
              JSON.parse( xhr.responseText ) : xhr.responseText;
            // 如果用户指定了成功回调函数，再执行
            context.success && context.success( data );
          } else {
            // 如果用户指定了失败的回调函数，再执行
            context.fail && context.fail( { "message": "请求错误." } );
          }
        }
      } 
      // 5:
      xhr.send( postData );
    }
  } );

  if ( typeof define === 'function' ){
    define( function (){
      return itcast;
    } );
  } else if ( typeof exports !== 'undefined' ) {
    module.exports = itcast;
  } else {
    global.$ = global.itcast = itcast;
  }
}( window ) );