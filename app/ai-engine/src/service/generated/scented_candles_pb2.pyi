from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class ChatRequest(_message.Message):
    __slots__ = ("user_id", "message", "chat_history")
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    CHAT_HISTORY_FIELD_NUMBER: _ClassVar[int]
    user_id: str
    message: str
    chat_history: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, user_id: _Optional[str] = ..., message: _Optional[str] = ..., chat_history: _Optional[_Iterable[str]] = ...) -> None: ...

class ChatChunk(_message.Message):
    __slots__ = ("delta_text", "is_finished")
    DELTA_TEXT_FIELD_NUMBER: _ClassVar[int]
    IS_FINISHED_FIELD_NUMBER: _ClassVar[int]
    delta_text: str
    is_finished: bool
    def __init__(self, delta_text: _Optional[str] = ..., is_finished: _Optional[bool] = ...) -> None: ...

class SearchQuery(_message.Message):
    __slots__ = ("query", "limit")
    QUERY_FIELD_NUMBER: _ClassVar[int]
    LIMIT_FIELD_NUMBER: _ClassVar[int]
    query: str
    limit: int
    def __init__(self, query: _Optional[str] = ..., limit: _Optional[int] = ...) -> None: ...

class CandleProduct(_message.Message):
    __slots__ = ("id", "name", "price", "image_url", "similarity_score")
    ID_FIELD_NUMBER: _ClassVar[int]
    NAME_FIELD_NUMBER: _ClassVar[int]
    PRICE_FIELD_NUMBER: _ClassVar[int]
    IMAGE_URL_FIELD_NUMBER: _ClassVar[int]
    SIMILARITY_SCORE_FIELD_NUMBER: _ClassVar[int]
    id: str
    name: str
    price: float
    image_url: str
    similarity_score: float
    def __init__(self, id: _Optional[str] = ..., name: _Optional[str] = ..., price: _Optional[float] = ..., image_url: _Optional[str] = ..., similarity_score: _Optional[float] = ...) -> None: ...

class SearchResponse(_message.Message):
    __slots__ = ("products",)
    PRODUCTS_FIELD_NUMBER: _ClassVar[int]
    products: _containers.RepeatedCompositeFieldContainer[CandleProduct]
    def __init__(self, products: _Optional[_Iterable[_Union[CandleProduct, _Mapping]]] = ...) -> None: ...

class ExtractRequest(_message.Message):
    __slots__ = ("raw_description",)
    RAW_DESCRIPTION_FIELD_NUMBER: _ClassVar[int]
    raw_description: str
    def __init__(self, raw_description: _Optional[str] = ...) -> None: ...

class ExtractResponse(_message.Message):
    __slots__ = ("top_notes", "middle_notes", "base_notes", "moods")
    TOP_NOTES_FIELD_NUMBER: _ClassVar[int]
    MIDDLE_NOTES_FIELD_NUMBER: _ClassVar[int]
    BASE_NOTES_FIELD_NUMBER: _ClassVar[int]
    MOODS_FIELD_NUMBER: _ClassVar[int]
    top_notes: _containers.RepeatedScalarFieldContainer[str]
    middle_notes: _containers.RepeatedScalarFieldContainer[str]
    base_notes: _containers.RepeatedScalarFieldContainer[str]
    moods: _containers.RepeatedScalarFieldContainer[str]
    def __init__(self, top_notes: _Optional[_Iterable[str]] = ..., middle_notes: _Optional[_Iterable[str]] = ..., base_notes: _Optional[_Iterable[str]] = ..., moods: _Optional[_Iterable[str]] = ...) -> None: ...
