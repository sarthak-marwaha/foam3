describe('Untyped Property', function() {
  var t;

  beforeEach(function() {
    foam.CLASS({
      name: 'PropTest',
      package: 'test',
      properties: [
        {
          name: 'b'
        },
      ]
    });
    t = test.PropTest.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('creates a Property by default', function() {
    expect(test.PropTest.B.cls_.name).toEqual('Property');
  });

});


describe('AbstractClass.getAxioms', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('coverage', function() {
    foam.core.Property.getAxioms();
    foam.core.Property.getAxioms(); // previous results cached
  });

});

describe('AbstractClass.toString', function() {

  beforeEach(function() {
  });
  afterEach(function() {
  });

  it('coverage', function() {
    foam.core.Property.toString();
  });

});


describe('Property Getter and Setter', function() {
  var t;
  var p;

  beforeEach(function() {
    foam.CLASS({
      name: 'GetterSetterTest',
      package: 'test',
      properties: [
        {
          name: 'b',
          adapt: function(old, nu) {
            p += 'adapt'+nu;
            return nu;
          },
          preSet: function(old, nu) {
            p += 'preSet'+nu;
            return nu;
          },
          postSet: function(old, nu) {
            p += 'postSet'+nu;
          },
        },
        {
          name: 'a',
          getter: function()  { return this.b; },
          setter: function(a) { this.b = a; }
        }
      ]
    });
    t = test.GetterSetterTest.create({});
    p = "";
  });
  afterEach(function() {
    t = null;
    p = "";
  });

  it('sets a value and gets it back', function() {
    t.a = 42;
    expect(t.a).toEqual(42);
  });
  it('sets a value via custom setter', function() {
    t.a = 42;
    expect(t.b).toEqual(42);
  })
  it('reads a value via custom getter', function() {
    t.b = 42;
    expect(t.a).toEqual(42);
  })
  it('sets values repeatedly and gets them back', function() {
    t.a = 42;
    expect(t.a).toEqual(42);
    t.a = 'hello';
    expect(t.a).toEqual('hello');
    t.a = -3;
    expect(t.a).toEqual(-3);
  });
  it('gets undefined when not yet set', function() {
    expect(t.a).toBeUndefined();
  });
  it('Hits defined adapt/pre/postSet', function() {
    t.b = 4;
    expect(p).toEqual('adapt4preSet4postSet4');
  });
});


describe('Property Factory', function() {
  var t;

  beforeEach(function() {
    foam.CLASS({
      name: 'FactoryTest',
      package: 'test',
      properties: [
        {
          name: 'a',
          factory: function() { this.testCount++; return 42; }
        },
        {
          name: 'testCount',
          defaultValue: 0
        }
      ]
    });
    t = test.FactoryTest.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('runs', function() {
    expect(t.testCount).toEqual(0); // factory not run on init
    expect(t.a).toEqual(42);
    expect(t.testCount).toEqual(1); // factory is run by getter
  });

  it('is overwritten by a set value', function() {
    expect(t.testCount).toEqual(0); // factory not run on init
    t.a = 84;
    expect(t.testCount).toEqual(0); // factory is not run by setter
    expect(t.a).toEqual(84); // setter overwrites factory value
    t.a = 96;
    expect(t.testCount).toEqual(0);
    expect(t.a).toEqual(96);
  });

});

describe('Property default comparators', function() {
  var c;

  beforeEach(function() {
    c = foam.core.Property.create().comparePropertyValues;
  });
  afterEach(function() {
    c = null;
  });


//         return o1.$UID.compareTo(o2.$UID);

  it('accepts ===', function() {
    var s = '';
    expect(c(s, s)).toEqual(0);
  });
  it('accepts double falsey', function() {
    expect(c(false, false)).toEqual(0);
    expect(c(NaN, NaN)).toEqual(0);
    expect(c(0, 0)).toEqual(0);
    expect(c('', '')).toEqual(0);
  });
  it('accepts left falsey', function() {
    expect(c(false, 6)).toEqual(-1);
    expect(c(NaN, 6)).toEqual(-1);
    expect(c(0, 6)).toEqual(-1);
    expect(c('', 6)).toEqual(-1);
  });
  it('accepts right falsey', function() {
    expect(c(4, false)).toEqual(1);
    expect(c(4, NaN)).toEqual(1);
    expect(c(4, 0)).toEqual(1);
    expect(c(4, '')).toEqual(1);
  });
  it('accepts localeCompare', function() {
    var o1 = { localeCompare: function(arg) { return 6; } };
    expect(c(o1, 3)).toEqual(6);
  });
  it('accepts compareTo', function() {
    var o1 = { compareTo: function(arg) { return 6; } };
    expect(c(o1, 3)).toEqual(6);
  });
  it('falls back on $UID.compareTo', function() {
    var o1 = {};
    var o2 = {};
    expect(c(o1, o2)).toEqual(-1);
  });
});



describe('Property default value', function() {
  var t;

  beforeEach(function() {
    foam.CLASS({
      name: 'DefaultValue',
      package: 'test',
      properties: [
        {
          name: 'a',
          defaultValue: 42
        }
      ]
    });
    t= test.DefaultValue.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('provides the value when not set', function() {
    expect(t.a).toEqual(42);
  });

  it('is overwritten by a set value', function() {
    expect(t.a).toEqual(42);
    t.a = 84;
    expect(t.a).toEqual(84);
  });

  it('provides the value when cleared', function() {
    expect(t.a).toEqual(42);
    t.a = 84;
    expect(t.a).toEqual(84);
    t.clearProperty('a');
    expect(t.a).toEqual(42);
  });

});
describe('Final property', function() {
  beforeEach(function() {
    foam.CLASS({
      name: 'Abc',
      package: 'test',
      properties: [
        {
          name: 'a',
          final: true
        }
      ]
    });
  });

  it('create with final set', function() {
    var abc = test.Abc.create({ a: 1 });
    expect(abc.a).toBe(1);
    abc.a = 2;
    expect(abc.a).toBe(1);
  });
  it('create unset and set after', function() {
    var abc = test.Abc.create();
    abc.a = 1;
    expect(abc.a).toBe(1);
    abc.a = 2;
    expect(abc.a).toBe(1);
  });
});

describe('Array', function() {
  var t;

  beforeEach(function() {
    foam.CLASS({ name: 'A', package: 'test', properties: [ { name: 'a' } ] });
    foam.CLASS({
      name: 'B',
      package: 'test',
      properties: [
        {
          class: 'Array', of: 'A',
          name: 'as'
        }
      ]
    });
  });
  afterEach(function() {
    t = null;
  });

  it('has a adapt', function() {
    var ap = foam.core.Array.create({});
    expect(ap.adapt).toBeTruthy();
  });

  // it('defaults to an empty array', function() {
  //   var b = test.B.create({});
  //   expect(b.as).toEqual([]);
  // });
  // TODO: enable when MyMdl.create(instanceA) clones correctly
//   it('accepts an array value of the correct type', function() {
//     var b = test.B.create({});
//     var a = test.A.create({ a: 'a' });
//     var aa = test.A.create({ a: 'aa' });

//     b.as = [a, aa];
//     expect(b.as.toString()).toEqual([a, aa].toString());

//     console.log('b',b.as[0], 'a', a)

//     expect(b.as[0]).toEqual(a);
//     expect(b.as[1]).toEqual(aa);
//   });

});



describe('Constants', function() {
  var t;
  var t2;

  beforeEach(function() {
    foam.CLASS({
      name: 'ConstantTest',
      package: 'test',
      constants: [
        {
          name: 'KEY',
          value: 'my_value'
        }
      ]
    });
    t = test.ConstantTest.create({});
    foam.CLASS({
      name: 'ConstantTest2',
      package: 'test',
      constants: {
        KEY: 'my_value',
        KEY2: 'my_value2',
      }

    });
    t2 = test.ConstantTest2.create({});
  });
  afterEach(function() {
    t = null;
    t2 = null;
  });

  it('are available on instances', function() {
    expect(t.KEY).not.toBeUndefined();
    expect(t.KEY).toEqual('my_value');
  });

  it('accepts short map syntax', function() {
    expect(t2.KEY).not.toBeUndefined();
    expect(t2.KEY).toEqual('my_value');
    expect(t2.KEY2).not.toBeUndefined();
    expect(t2.KEY2).toEqual('my_value2');
  });

});


describe('Model.extends inheritance, isInstance(), isSubClass(), getAxioms()', function() {
  var person;
  var employee;

  beforeEach(function() {
    foam.CLASS({
      name: 'Person',
      package: 'test',
      constants: [
        {
          name: 'KEY',
          value: 'my_value'
        }
      ],

      properties: [
        {
          class: 'String',
          name: 'name'
        },
        'age',
        {
          name: 'result'
        }
      ],

      methods: [
        function init() { },
        {
          name: 'sayHello',
          code: function() { this.result = 'hello '+this.name; }
        },
        function sayGoodbye() { this.result = "bye "+this.name; }
      ]
    });
    person = test.Person.create({name: 'Adam', age: 0});

    foam.CLASS({
      name: 'Employee',
      extends: 'test.Person',
      package: 'test',
      properties: [
        {
          name: 'salary'
        }
      ],

      methods: [
        function toString() {
          return this.cls_.name + '(' + this.name + ', ' + this.age + ', ' + this.salary + ')';
        }
      ]
    });
    employee = test.Employee.create({name: 'Jane', age: 30, salary: 50000});
  });
  afterEach(function() {
    person = null;
    employee = null;
  });

  it('inherits methods', function() {
    person.sayHello();
    employee.sayHello();
    expect(person.result).toEqual('hello Adam');
    expect(employee.result).toEqual('hello Jane');
    expect(employee.sayGoodbye).not.toBeUndefined();
  });
  it('inherits constants', function() {
    expect(person.KEY).toEqual('my_value');
    expect(employee.KEY).toEqual('my_value');
  });

  it('reports correct subclass checks', function() {
    expect(test.Person.isSubClass(test.Employee)).toBe(true);
    expect(test.Employee.isSubClass(test.Person)).toBe(false);

    foam.CLASS({ name: 'Fake', package: 'test' });
    expect(test.Person.isSubClass(test.Fake)).toBe(false);
  });

  it('reports correct subclass checks', function() {
    expect(test.Person.isInstance(person)).toBe(true);
    expect(test.Employee.isInstance(person)).toBe(false);
    expect(test.Person.isInstance(employee)).toBe(true);

    foam.CLASS({ name: 'Fake', package: 'test' });
    expect(test.Person.isInstance(test.Fake.create({}))).toBe(false);
  });

  it('returns axioms correctly', function() {
    expect(test.Person.getAxiomByName('age')).toBe(test.Person.AGE);

    var axs = test.Person.getAxiomsByClass(foam.core.Property);
    expect(axs.length).toEqual(3);
    expect(axs[0]).toBe(test.Person.NAME);
    expect(axs[1]).toBe(test.Person.AGE);
    expect(axs[2]).toBe(test.Person.RESULT);
  });

});

describe('Model.implements', function() {
  var person;

  beforeEach(function() {
    foam.CLASS({
      package: 'test',
      name: 'HelloBase',
      methods: [
        {
          name: 'sayHello',
          code: function() { this.result = 'Base hello '; }
        },
        {
          name: 'sayGoodbye',
          code: function() { this.result = 'Base bye '; }
        },
      ]
    });


    foam.CLASS({
      package: 'test',
      name: 'SalariedI',
      properties: [
        {
          name: 'salary',
          defaultValue: 50000
        }
      ],

      methods: [
        {
          name: 'sayHello',
          code: function() { this.result = 'BIG HELLO '+this.name; }
        },
        {
          name: 'sayGoodbye',
          code: function() { this.result = 'BYE '+this.name; }
        },
      ]
    });

    foam.CLASS({
      name: 'Person',
      extends: 'test.HelloBase',
      implements: [ 'test.SalariedI' ],
      package: 'test',
      properties: [
        {
          class: 'String',
          name: 'name'
        },
        'age',
        {
          name: 'result'
        }
      ],

      methods: [
        {
          name: 'sayHello',
          code: function() { this.result = 'hello '+this.name; }
        },
      ]
    });
    person = test.Person.create();
  });
  afterEach(function() {
    person = null;
  });

  it('inherits methods', function() {
    person.name = "Joe";
    person.sayHello();
    expect(person.result).toEqual("hello Joe"); // Person overrides everyone
    person.sayGoodbye();
    expect(person.result).toEqual("BYE Joe"); // SalariedI overrides HelloBase
  });

});

describe('Model.classes', function() {
  var innerSelf;

  beforeEach(function() {

    foam.CLASS({
      name: 'Person',
      package: 'test',
      classes: [
        {
          name: 'InnerSelf',
          properties: [
            'me','myself','i'
          ],
        }
      ],

      properties: [
        {
          class: 'String',
          name: 'name'
        },
        'age',
        {
          name: 'result'
        }
      ],

      methods: [
        {
          name: 'sayHello',
          code: function() { this.result = 'hello '+this.name; }
        },
      ]
    });

  });
  afterEach(function() {
    innerSelf = null;
  });

  it('installs models', function() {
    expect(test.Person.InnerSelf).not.toBeUndefined();
  });

  it('processes model properties', function() {
    innerSelf = test.Person.InnerSelf.create({
      me: 43,
      myself: 'hello',
      i: ''
    });
    expect(innerSelf.me).toEqual(43);
    expect(innerSelf.myself).toEqual('hello');
    expect(innerSelf.i).toEqual('');

  });

});


describe('FObject white box test', function() {
  beforeEach(function() {
    foam.CLASS({
      name: 'Person',
      package: 'test',
      properties: [
        {
          class: 'String',
          name: 'name'
        },
        {
          name: 'age'
        },
      ],
    });
  });
  afterEach(function() {
  });

  it('inits from null', function() {
    var o = test.Person.create();
    expect(o.name).toEqual('');
  });
  it('inits from a POJSO', function() {
    var o = test.Person.create({ name: 'prop1' });

    expect(o.name).toEqual('prop1');
  });
  it('inits from another FObject', function() {
    var o = test.Person.create({ name: 'prop1' });
    var o2 = test.Person.create(o);

    expect(o2.name).toEqual('prop1');
  });
  it('covers init from another FObject with no instance_', function() {
    var prot = { name: 'prop1' };
    var o = test.Person.create(Object.create(prot));

    expect(o.name).toEqual('prop1');
  });
  it('toString()s nicely', function() {
    var o = test.Person.create();
    o.toString();
  });

});


describe('Method overrides and SUPER', function() {
  var m;
  var s;

  beforeEach(function() {
    foam.CLASS({
      name: 'BaseClass',
      package: 'test',
      methods: [
        function base() {
          return 5;
        }
      ]
    });
    foam.CLASS({
      name: 'SubClass',
      extends: 'test.BaseClass',
      package: 'test',
      methods: [
        function base() {
          return this.SUPER() + 1;
        }
      ]
    });
    foam.CLASS({
      name: 'SubSubClass',
      extends: 'test.SubClass',
      package: 'test',
      methods: [
        function base() {
          return this.SUPER() + 2;
        }
      ]
    });
    m = test.SubClass.create();
    s = test.SubSubClass.create();
  });
  afterEach(function() {
    BaseClass = undefined;
    SubClass = undefined;
    SubSubClass = undefined;
    m = null;
    s = null;
  });

  it('SUPER is defined for overriden methods', function() {
    expect(function() { m.base(); }).not.toThrow();
    expect(m.base()).toEqual(6);
    m.base.toString();
  });
  it('SUPER slow path works', function() {
    expect(function() { s.base(); }).not.toThrow();
    expect(s.base()).toEqual(8);
  });

});



describe('Property Mlang interop', function() {
  var t;

  beforeEach(function() {
    foam.CLASS({
      name: 'MTest',
      package: 'test',
      properties: [
        {
          name: 'a',
          defaultValue: 45,
        },
      ]
    });
    t = test.MTest.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('predicate support works', function() {
    expect(test.MTest.A.f(t)).toEqual(45); // extracts 'a' property of instance t
  });
  it('compare support works', function() {
    var t2 = test.MTest.create({ a: 45 });
    expect(test.MTest.A.compare(t, t2)).toEqual(0);
    t2.a = 2;
    expect(test.MTest.A.compare(t, t2)).toEqual(1);
    t.a = 1;
    expect(test.MTest.A.compare(t, t2)).toEqual(-1);
  });
});


describe('Dynamics', function() {
  var t;
  var t2;

  beforeEach(function() {
    foam.CLASS({
      name: 'MTest',
      package: 'test',
      properties: [
        {
          name: 'a',
          defaultValue: 45,
        },
      ]
    });
    t = test.MTest.create();
    t2 = test.MTest.create();
  });
  afterEach(function() {
    t = null;
    t2 = null;
  });

  it('creates a slot for a property', function() {
    expect(t.a$).not.toBeUndefined();
    expect(t.a$.isDefined()).toBe(false);
    t.a = 4;
    expect(t.a$.isDefined()).toBe(true);
  });
  it('binds property slots', function() {
    t.a$ = t2.a$; // bind
    t.a = 999;
    expect(t2.a).toEqual(999);
  });
  it('allows links to be destroyed', function() {
    var b = t.a$.link(t2.a$);
    t.a = 999;

    b.destroy();

    t.a = 4;
    expect(t.a).toEqual(4);
    expect(t2.a).toEqual(999);
  });
  it('allows follows to be destroyed', function() {
    var b = t2.a$.follow(t.a$);
    t.a = 999;

    b.destroy();

    t.a = 4;
    expect(t.a).toEqual(4);
    expect(t2.a).toEqual(999);
  });
//   it('clears the property', function() {
//     var b = t2.a$.follow(t.a$);
//     t.a = 999;
//     expect(t2.a).toEqual(999);
//     t.a$.clear();
//     expect(t2.a).toEqual(45);
//   });
  it('subscribes manual listeners', function() {
    var last_args, last_value;
    var l = function() {
      last_args = Array.prototype.slice.call(arguments);
      last_value = last_args[3].get();
    };
    t.a$.subscribe(l);
    t.a = 999;
    expect(last_args).toBeDefined();
    expect(last_args[2]).toEqual('a');
    expect(last_value).toEqual(999);
  });
  it('unsubscribes manual listeners', function() {
    var last_args, last_value;
    var l = function() {
      last_args = Array.prototype.slice.call(arguments);
      last_value = last_args[3].get();
    };
    t.a$.subscribe(l);
    t.a = 999;

    t.a$.unsubscribe(l);
    t.a = 49;

    // same as the first time
    expect(last_args).toBeDefined();
    expect(last_args[2]).toEqual('a');
    expect(last_value).toEqual(999);
  });
});


describe('Listeners', function() {
  var t;

  beforeEach(function() {
    foam.CLASS({
      name: 'Sprinkler',
      package: 'test',
      listeners: [
        function onAlarm() {  },
        {
          name: 'onClear',
          isFramed: true,
          code: function() { }
        }
      ]
    });
    t = test.Sprinkler.create({});
  });
  afterEach(function() {
    t = null;
  });

  it('listeners are installed as method-alikes', function() {
    t.onAlarm();
    t.onClear();
  });
});



describe('Bootstrap invariants', function() {
  it('Check that all recursive relationships are properly set', function() {
    expect(foam.core.Model.isInstance(foam.core.Model.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.FObject.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Property.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Method.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.String.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Array.model_)).toBe(true);
  });

  it('Check that Class.model_ and Class.prototype.model_ are the same object', function() {
    expect(foam.core.Model.isInstance(foam.core.AxiomArray.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Constant.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Implements.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Dynamic.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.internal.DynamicProperty.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Topic.model_)).toBe(true);
    expect(foam.core.Model.isInstance(foam.core.Boolean.model_)).toBe(true);
  });
})
