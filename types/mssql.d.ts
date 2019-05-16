export function BIGINT(): any;
export namespace BIGINT {
    const declaration: string;
    function inspect(): void;
}
export function BINARY(length: any): any;
export namespace BINARY {
    const declaration: string;
    function inspect(): void;
}
export function BIT(): any;
export namespace BIT {
    const declaration: string;
    function inspect(): void;
}
export function BigInt(): any;
export namespace BigInt {
    const declaration: string;
    function inspect(): void;
}
export function Binary(length: any): any;
export namespace Binary {
    const declaration: string;
    function inspect(): void;
}
export function Bit(): any;
export namespace Bit {
    const declaration: string;
    function inspect(): void;
}
export function CHAR(length: any): any;
export namespace CHAR {
    const declaration: string;
    function inspect(): void;
}
export function Char(length: any): any;
export namespace Char {
    const declaration: string;
    function inspect(): void;
}
export class ConnectionError {
    static captureStackTrace(p0: any, p1: any): any;
    static prepareStackTrace: any;
    static stackTraceLimit: number;
    constructor(message: any, code: any);
    code: any;
    name: any;
}
export class ConnectionPool {
    static defaultMaxListeners: any;
    static init(): void;
    static listenerCount(emitter: any, type: any): any;
    static usingDomains: boolean;
    acquire(requester: any, callback: any): any;
    addListener(type: any, listener: any): any;
    batch(...args: any[]): any;
    close(callback: any): any;
    connect(callback: any): any;
    emit(type: any, args: any): any;
    eventNames(): any;
    getMaxListeners(): any;
    listenerCount(type: any): any;
    listeners(type: any): any;
    off(type: any, listener: any): any;
    on(type: any, listener: any): any;
    once(type: any, listener: any): any;
    prependListener(type: any, listener: any): any;
    prependOnceListener(type: any, listener: any): any;
    query(...args: any[]): any;
    rawListeners(type: any): any;
    release(connection: any): any;
    removeAllListeners(type: any, ...args: any[]): any;
    removeListener(type: any, listener: any): any;
    request(): any;
    setMaxListeners(n: any): any;
    transaction(): any;
}
export namespace ConnectionPool {
    class EventEmitter {
        // Circular reference from index.ConnectionPool.EventEmitter
        static EventEmitter: any;
        static defaultMaxListeners: any;
        static init(): void;
        static listenerCount(emitter: any, type: any): any;
        static usingDomains: boolean;
        addListener(type: any, listener: any): any;
        emit(type: any, args: any): any;
        eventNames(): any;
        getMaxListeners(): any;
        listenerCount(type: any): any;
        listeners(type: any): any;
        off(type: any, listener: any): any;
        on(type: any, listener: any): any;
        once(type: any, listener: any): any;
        prependListener(type: any, listener: any): any;
        prependOnceListener(type: any, listener: any): any;
        rawListeners(type: any): any;
        removeAllListeners(type: any, ...args: any[]): any;
        removeListener(type: any, listener: any): any;
        setMaxListeners(n: any): any;
    }
}
export function DATE(): any;
export namespace DATE {
    const declaration: string;
    function inspect(): void;
}
export function DATETIME(): any;
export namespace DATETIME {
    const declaration: string;
    function inspect(): void;
}
export function DATETIME2(scale: any): any;
export namespace DATETIME2 {
    const declaration: string;
    function inspect(): void;
}
export function DATETIMEOFFSET(scale: any): any;
export namespace DATETIMEOFFSET {
    const declaration: string;
    function inspect(): void;
}
export function DECIMAL(precision: any, scale: any): any;
export namespace DECIMAL {
    const declaration: string;
    function inspect(): void;
}
export function Date(): any;
export namespace Date {
    const declaration: string;
    function inspect(): void;
}
export function DateTime(): any;
export namespace DateTime {
    const declaration: string;
    function inspect(): void;
}
export function DateTime2(scale: any): any;
export namespace DateTime2 {
    const declaration: string;
    function inspect(): void;
}
export function DateTimeOffset(scale: any): any;
export namespace DateTimeOffset {
    const declaration: string;
    function inspect(): void;
}
export function Decimal(precision: any, scale: any): any;
export namespace Decimal {
    const declaration: string;
    function inspect(): void;
}
export function FLOAT(): any;
export namespace FLOAT {
    const declaration: string;
    function inspect(): void;
}
export function Float(): any;
export namespace Float {
    const declaration: string;
    function inspect(): void;
}
export function GEOGRAPHY(): any;
export namespace GEOGRAPHY {
    const declaration: string;
    function inspect(): void;
}
export function GEOMETRY(): any;
export namespace GEOMETRY {
    const declaration: string;
    function inspect(): void;
}
export function Geography(): any;
export namespace Geography {
    const declaration: string;
    function inspect(): void;
}
export function Geometry(): any;
export namespace Geometry {
    const declaration: string;
    function inspect(): void;
}
export function IMAGE(): any;
export namespace IMAGE {
    const declaration: string;
    function inspect(): void;
}
export function INT(): any;
export namespace INT {
    const declaration: string;
    function inspect(): void;
}
export const ISOLATION_LEVEL: {
    READ_COMMITTED: number;
    READ_UNCOMMITTED: number;
    REPEATABLE_READ: number;
    SERIALIZABLE: number;
    SNAPSHOT: number;
};
export function Image(): any;
export namespace Image {
    const declaration: string;
    function inspect(): void;
}
export function Int(): any;
export namespace Int {
    const declaration: string;
    function inspect(): void;
}
export const MAX: number;
export function MONEY(): any;
export namespace MONEY {
    const declaration: string;
    function inspect(): void;
}
export function Money(): any;
export namespace Money {
    const declaration: string;
    function inspect(): void;
}
export function NCHAR(length: any): any;
export namespace NCHAR {
    const declaration: string;
    function inspect(): void;
}
export function NChar(length: any): any;
export namespace NChar {
    const declaration: string;
    function inspect(): void;
}
export function NTEXT(): any;
export namespace NTEXT {
    const declaration: string;
    function inspect(): void;
}
export function NText(): any;
export namespace NText {
    const declaration: string;
    function inspect(): void;
}
export function NUMERIC(precision: any, scale: any): any;
export namespace NUMERIC {
    const declaration: string;
    function inspect(): void;
}
export function NVARCHAR(length: any): any;
export namespace NVARCHAR {
    const declaration: string;
    function inspect(): void;
}
export function NVarChar(length: any): any;
export namespace NVarChar {
    const declaration: string;
    function inspect(): void;
}
export function Numeric(precision: any, scale: any): any;
export namespace Numeric {
    const declaration: string;
    function inspect(): void;
}
export class PreparedStatement {
    static defaultMaxListeners: any;
    static init(): void;
    static listenerCount(emitter: any, type: any): any;
    static usingDomains: boolean;
    constructor(parent: any);
    parent: any;
    prepared: any;
    parameters: any;
    acquire(request: any, callback: any): any;
    addListener(type: any, listener: any): any;
    emit(type: any, args: any): any;
    eventNames(): any;
    execute(values: any, callback: any): any;
    getMaxListeners(): any;
    input(name: any, type: any, ...args: any[]): any;
    listenerCount(type: any): any;
    listeners(type: any): any;
    off(type: any, listener: any): any;
    on(type: any, listener: any): any;
    once(type: any, listener: any): any;
    output(name: any, type: any, ...args: any[]): any;
    prepare(statement: any, callback: any): any;
    prependListener(type: any, listener: any): any;
    prependOnceListener(type: any, listener: any): any;
    rawListeners(type: any): any;
    release(connection: any): any;
    removeAllListeners(type: any, ...args: any[]): any;
    removeListener(type: any, listener: any): any;
    setMaxListeners(n: any): any;
    unprepare(callback: any): any;
}
export namespace PreparedStatement {
    class EventEmitter {
        // Circular reference from index.PreparedStatement.EventEmitter
        static EventEmitter: any;
        static defaultMaxListeners: any;
        static init(): void;
        static listenerCount(emitter: any, type: any): any;
        static usingDomains: boolean;
        addListener(type: any, listener: any): any;
        emit(type: any, args: any): any;
        eventNames(): any;
        getMaxListeners(): any;
        listenerCount(type: any): any;
        listeners(type: any): any;
        off(type: any, listener: any): any;
        on(type: any, listener: any): any;
        once(type: any, listener: any): any;
        prependListener(type: any, listener: any): any;
        prependOnceListener(type: any, listener: any): any;
        rawListeners(type: any): any;
        removeAllListeners(type: any, ...args: any[]): any;
        removeListener(type: any, listener: any): any;
        setMaxListeners(n: any): any;
    }
}
export class PreparedStatementError {
    static captureStackTrace(p0: any, p1: any): any;
    static prepareStackTrace: any;
    static stackTraceLimit: number;
    constructor(message: any, code: any);
    code: any;
    name: any;
}
export const Promise: any;
export function REAL(): any;
export namespace REAL {
    const declaration: string;
    function inspect(): void;
}
export function Real(): any;
export namespace Real {
    const declaration: string;
    function inspect(): void;
}
export class Request {
    static defaultMaxListeners: any;
    static init(): void;
    static listenerCount(emitter: any, type: any): any;
    static usingDomains: boolean;
    addListener(type: any, listener: any): any;
    batch(batch: any, callback: any, ...args: any[]): any;
    bulk(table: any, callback: any): any;
    cancel(): any;
    emit(type: any, args: any): any;
    eventNames(): any;
    execute(command: any, callback: any): any;
    getMaxListeners(): any;
    input(name: any, type: any, value: any, ...args: any[]): any;
    listenerCount(type: any): any;
    listeners(type: any): any;
    off(type: any, listener: any): any;
    on(type: any, listener: any): any;
    once(type: any, listener: any): any;
    output(name: any, type: any, value: any): any;
    pipe(stream: any): any;
    prependListener(type: any, listener: any): any;
    prependOnceListener(type: any, listener: any): any;
    query(command: any, callback: any, ...args: any[]): any;
    rawListeners(type: any): any;
    removeAllListeners(type: any, ...args: any[]): any;
    removeListener(type: any, listener: any): any;
    setMaxListeners(n: any): any;
}
export namespace Request {
    class EventEmitter {
        // Circular reference from index.Request.EventEmitter
        static EventEmitter: any;
        static defaultMaxListeners: any;
        static init(): void;
        static listenerCount(emitter: any, type: any): any;
        static usingDomains: boolean;
        addListener(type: any, listener: any): any;
        emit(type: any, args: any): any;
        eventNames(): any;
        getMaxListeners(): any;
        listenerCount(type: any): any;
        listeners(type: any): any;
        off(type: any, listener: any): any;
        on(type: any, listener: any): any;
        once(type: any, listener: any): any;
        prependListener(type: any, listener: any): any;
        prependOnceListener(type: any, listener: any): any;
        rawListeners(type: any): any;
        removeAllListeners(type: any, ...args: any[]): any;
        removeListener(type: any, listener: any): any;
        setMaxListeners(n: any): any;
    }
}
export class RequestError {
    static captureStackTrace(p0: any, p1: any): any;
    static prepareStackTrace: any;
    static stackTraceLimit: number;
    constructor(message: any, code: any);
    code: any;
    number: any;
    lineNumber: any;
    state: any;
    class: any;
    serverName: any;
    procName: any;
    name: any;
    message: any;
}
export function SMALLDATETIME(): any;
export namespace SMALLDATETIME {
    const declaration: string;
    function inspect(): void;
}
export function SMALLINT(): any;
export namespace SMALLINT {
    const declaration: string;
    function inspect(): void;
}
export function SMALLMONEY(): any;
export namespace SMALLMONEY {
    const declaration: string;
    function inspect(): void;
}
export function SmallDateTime(): any;
export namespace SmallDateTime {
    const declaration: string;
    function inspect(): void;
}
export function SmallInt(): any;
export namespace SmallInt {
    const declaration: string;
    function inspect(): void;
}
export function SmallMoney(): any;
export namespace SmallMoney {
    const declaration: string;
    function inspect(): void;
}
export function TEXT(): any;
export namespace TEXT {
    const declaration: string;
    function inspect(): void;
}
export function TIME(scale: any): any;
export namespace TIME {
    const declaration: string;
    function inspect(): void;
}
export function TINYINT(): any;
export namespace TINYINT {
    const declaration: string;
    function inspect(): void;
}
export function TVP(tvpType: any): any;
export namespace TVP {
    const declaration: string;
    function inspect(): void;
}
export namespace TYPES {
    function BigInt(): any;
    namespace BigInt {
        const declaration: string;
        function inspect(): void;
    }
    function Binary(length: any): any;
    namespace Binary {
        const declaration: string;
        function inspect(): void;
    }
    function Bit(): any;
    namespace Bit {
        const declaration: string;
        function inspect(): void;
    }
    function Char(length: any): any;
    namespace Char {
        const declaration: string;
        function inspect(): void;
    }
    function Date(): any;
    namespace Date {
        const declaration: string;
        function inspect(): void;
    }
    function DateTime(): any;
    namespace DateTime {
        const declaration: string;
        function inspect(): void;
    }
    function DateTime2(scale: any): any;
    namespace DateTime2 {
        const declaration: string;
        function inspect(): void;
    }
    function DateTimeOffset(scale: any): any;
    namespace DateTimeOffset {
        const declaration: string;
        function inspect(): void;
    }
    function Decimal(precision: any, scale: any): any;
    namespace Decimal {
        const declaration: string;
        function inspect(): void;
    }
    function Float(): any;
    namespace Float {
        const declaration: string;
        function inspect(): void;
    }
    function Geography(): any;
    namespace Geography {
        const declaration: string;
        function inspect(): void;
    }
    function Geometry(): any;
    namespace Geometry {
        const declaration: string;
        function inspect(): void;
    }
    function Image(): any;
    namespace Image {
        const declaration: string;
        function inspect(): void;
    }
    function Int(): any;
    namespace Int {
        const declaration: string;
        function inspect(): void;
    }
    function Money(): any;
    namespace Money {
        const declaration: string;
        function inspect(): void;
    }
    function NChar(length: any): any;
    namespace NChar {
        const declaration: string;
        function inspect(): void;
    }
    function NText(): any;
    namespace NText {
        const declaration: string;
        function inspect(): void;
    }
    function NVarChar(length: any): any;
    namespace NVarChar {
        const declaration: string;
        function inspect(): void;
    }
    function Numeric(precision: any, scale: any): any;
    namespace Numeric {
        const declaration: string;
        function inspect(): void;
    }
    function Real(): any;
    namespace Real {
        const declaration: string;
        function inspect(): void;
    }
    function SmallDateTime(): any;
    namespace SmallDateTime {
        const declaration: string;
        function inspect(): void;
    }
    function SmallInt(): any;
    namespace SmallInt {
        const declaration: string;
        function inspect(): void;
    }
    function SmallMoney(): any;
    namespace SmallMoney {
        const declaration: string;
        function inspect(): void;
    }
    function TVP(tvpType: any): any;
    namespace TVP {
        const declaration: string;
        function inspect(): void;
    }
    function Text(): any;
    namespace Text {
        const declaration: string;
        function inspect(): void;
    }
    function Time(scale: any): any;
    namespace Time {
        const declaration: string;
        function inspect(): void;
    }
    function TinyInt(): any;
    namespace TinyInt {
        const declaration: string;
        function inspect(): void;
    }
    function UDT(): any;
    namespace UDT {
        const declaration: string;
        function inspect(): void;
    }
    function UniqueIdentifier(): any;
    namespace UniqueIdentifier {
        const declaration: string;
        function inspect(): void;
    }
    function VarBinary(length: any): any;
    namespace VarBinary {
        const declaration: string;
        function inspect(): void;
    }
    function VarChar(length: any): any;
    namespace VarChar {
        const declaration: string;
        function inspect(): void;
    }
    function Variant(): any;
    namespace Variant {
        const declaration: string;
        function inspect(): void;
    }
    function Xml(): any;
    namespace Xml {
        const declaration: string;
        function inspect(): void;
    }
}
export class Table {
    static fromRecordset(recordset: any, name: any): any;
    static parseName(name: any): any;
    constructor(name: any);
    name: any;
    schema: any;
    database: any;
    path: any;
    temporary: any;
    columns: any;
    rows: any;
    declare(): any;
}
export function Text(): any;
export namespace Text {
    const declaration: string;
    function inspect(): void;
}
export function Time(scale: any): any;
export namespace Time {
    const declaration: string;
    function inspect(): void;
}
export function TinyInt(): any;
export namespace TinyInt {
    const declaration: string;
    function inspect(): void;
}
export class Transaction {
    static defaultMaxListeners: any;
    static init(): void;
    static listenerCount(emitter: any, type: any): any;
    static usingDomains: boolean;
    constructor(parent: any);
    acquire(request: any, callback: any): any;
    addListener(type: any, listener: any): any;
    begin(isolationLevel: any, callback: any): any;
    commit(callback: any): any;
    emit(type: any, args: any): any;
    eventNames(): any;
    getMaxListeners(): any;
    listenerCount(type: any): any;
    listeners(type: any): any;
    off(type: any, listener: any): any;
    on(type: any, listener: any): any;
    once(type: any, listener: any): any;
    prependListener(type: any, listener: any): any;
    prependOnceListener(type: any, listener: any): any;
    rawListeners(type: any): any;
    release(connection: any): any;
    removeAllListeners(type: any, ...args: any[]): any;
    removeListener(type: any, listener: any): any;
    request(): any;
    rollback(callback: any): any;
    setMaxListeners(n: any): any;
}
export namespace Transaction {
    class EventEmitter {
        // Circular reference from index.Transaction.EventEmitter
        static EventEmitter: any;
        static defaultMaxListeners: any;
        static init(): void;
        static listenerCount(emitter: any, type: any): any;
        static usingDomains: boolean;
        addListener(type: any, listener: any): any;
        emit(type: any, args: any): any;
        eventNames(): any;
        getMaxListeners(): any;
        listenerCount(type: any): any;
        listeners(type: any): any;
        off(type: any, listener: any): any;
        on(type: any, listener: any): any;
        once(type: any, listener: any): any;
        prependListener(type: any, listener: any): any;
        prependOnceListener(type: any, listener: any): any;
        rawListeners(type: any): any;
        removeAllListeners(type: any, ...args: any[]): any;
        removeListener(type: any, listener: any): any;
        setMaxListeners(n: any): any;
    }
}
export class TransactionError {
    static captureStackTrace(p0: any, p1: any): any;
    static prepareStackTrace: any;
    static stackTraceLimit: number;
    constructor(message: any, code: any);
    code: any;
    name: any;
}
export function UDT(): any;
export namespace UDT {
    const declaration: string;
    function inspect(): void;
}
export function UNIQUEIDENTIFIER(): any;
export namespace UNIQUEIDENTIFIER {
    const declaration: string;
    function inspect(): void;
}
export function UniqueIdentifier(): any;
export namespace UniqueIdentifier {
    const declaration: string;
    function inspect(): void;
}
export function VARBINARY(length: any): any;
export namespace VARBINARY {
    const declaration: string;
    function inspect(): void;
}
export function VARCHAR(length: any): any;
export namespace VARCHAR {
    const declaration: string;
    function inspect(): void;
}
export function VARIANT(): any;
export namespace VARIANT {
    const declaration: string;
    function inspect(): void;
}
export function VarBinary(length: any): any;
export namespace VarBinary {
    const declaration: string;
    function inspect(): void;
}
export function VarChar(length: any): any;
export namespace VarChar {
    const declaration: string;
    function inspect(): void;
}
export function Variant(): any;
export namespace Variant {
    const declaration: string;
    function inspect(): void;
}
export function XML(): any;
export namespace XML {
    const declaration: string;
    function inspect(): void;
}
export function Xml(): any;
export namespace Xml {
    const declaration: string;
    function inspect(): void;
}
export function batch(...args: any[]): any;
export function close(callback: any): any;
export function connect(config: any, callback: any): any;
export function getTypeByValue(value: any): any;
export const map: {
    js: Function;
    sql: Function;
}[];
export function off(event: any, handler: any): any;
export function on(event: any, handler: any): any;
export function query(...args: any[]): any;
export function removeListener(event: any, handler: any): any;
