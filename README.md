# Typescript Redux-like library for data layer management

__THIS IS DEV PREVIEW.__

It is partialy compatible with redux API.

It is built with 5 principles in mind:

1. Type safe data layer manipilation with minimal as possible overhead on typing. Redux is too dynamic and can't be typed enough with its reducers mechanism, because you don't explicitly call it (may be in future version of TS this would be fixed, but it is hard dynamic approach).
2. No messing with string constants by default.
3. Data layer knows every action that could be dispatched through it to change state.
4. There may be more than one data layer. It would not affect serialization of full state of application, just provide layer to separation of data layers. One big state is cool, but making you application a little bit coupled.
5. A little less magic for reducers: reduce you state explicit by calling them, not passing as magic callback around.

In result you get autocomplete, type checking, method to separate layer to unit test your application easy.

### Differencies with Redux

There is no "Store" concept, but "Context" on its place. It is quite similiar, but could be more than one instance for different layers of application, to separate concerns.

### Why typescript? Why not Flow?

#### Flow is not used because it is not production ready enough

For example it doesn't run on windows, have problems with support of ES6 features, doesn't have analog of `.d.ts` files (so it's not suitable for typing of libraries that would be used with simple javascript without flow). But it's type system is quite impressive.

#### Typescript has good goals

And best of goals is: __not create new language, just help javascript programmers to write type safe programms with basic JS usage patterns.__
Quite similiar to flow, but without weird ocaml thing :)

#### Typescript is quite good

This language starts to develop quickly after 1.5 release, and many features that they making (or wanted to make) really improve JS experience (DX), and hopely, it will get most of neat features from Flow or better :)

#### Sometimes it's typesystem is not good enough, but you can hack it

Yes, it is good and bad in one time, but i think this type hacks must be used only in libraries \ frameworks hidden under good api, not on application level logic.
