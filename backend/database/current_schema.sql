--
-- PostgreSQL database dump
--

\restrict YeTffZfF4IpXZ9ZjUOOMtlxSHiUpnOC3wUSWDnabKJCnmsSzYM5xvdqdcn1sNc2

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.categories ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id bigint CONSTRAINT expenses_id_not_null NOT NULL,
    user_id bigint CONSTRAINT expenses_user_id_not_null NOT NULL,
    category_id bigint,
    amount numeric(12,2) CONSTRAINT expenses_amount_not_null NOT NULL,
    payment_method character varying(50),
    notes text,
    transaction_date date CONSTRAINT expenses_expense_date_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT expenses_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT expenses_updated_at_not_null NOT NULL,
    type character varying(20) NOT NULL,
    CONSTRAINT positive_expense_amount CHECK ((amount > (0)::numeric)),
    CONSTRAINT valid_transaction_type CHECK (((type)::text = ANY ((ARRAY['expense'::character varying, 'income'::character varying])::text[])))
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.transactions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.expenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    default_currency character(3) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    name text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: transactions expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: categories unique_category_name_per_user; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT unique_category_name_per_user UNIQUE (user_id, name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_transactions_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_transactions_user_date ON public.transactions USING btree (user_id, transaction_date DESC);


--
-- Name: unique_category_per_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_category_per_user ON public.categories USING btree (user_id, lower((name)::text));


--
-- Name: categories fk_categories_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: transactions fk_expenses_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: transactions fk_expenses_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict YeTffZfF4IpXZ9ZjUOOMtlxSHiUpnOC3wUSWDnabKJCnmsSzYM5xvdqdcn1sNc2

