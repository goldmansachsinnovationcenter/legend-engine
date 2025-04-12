// Copyright 2020 Goldman Sachs
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package org.finos.legend.pure.runtime.java.compiled.compiler;

import io.github.classgraph.ClassGraph;
import org.eclipse.collections.api.factory.Lists;
import org.eclipse.collections.api.list.MutableList;
import org.finos.legend.engine.shared.javaCompiler.MemoryClassLoader;
import org.finos.legend.engine.shared.javaCompiler.MemoryFileManager;

import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileManager;
import javax.tools.JavaFileObject;
import javax.tools.ToolProvider;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Collections;
import java.util.Map;
import java.util.WeakHashMap;
import java.util.jar.JarOutputStream;

public class PureJavaCompiler
{
    private static final Map<ClassLoader, String> CLASSPATH_CACHE = Collections.synchronizedMap(new WeakHashMap<>());

    private final MemoryFileManager coreManager;
    private final MemoryFileManager dynamicManager;
    private final MemoryClassLoader coreClassLoader;
    private final MemoryClassLoader globalClassLoader;

    public PureJavaCompiler()
    {
        this(Thread.currentThread().getContextClassLoader());
    }

    public PureJavaCompiler(ClassLoader parent)
    {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        this.coreManager = new MemoryFileManager(compiler);
        this.dynamicManager = new MemoryFileManager(compiler);
        this.coreClassLoader = new MemoryClassLoader(this.coreManager, parent);
        this.globalClassLoader = new MemoryClassLoader(this.dynamicManager, this.coreClassLoader);
    }

    public void compile(Iterable<? extends JavaFileObject> compilationUnits) throws PureJavaCompileException
    {
        compile(compilationUnits, false);
    }

    public void compile(Iterable<? extends JavaFileObject> compilationUnits, boolean isDynamic) throws PureJavaCompileException
    {
        compile(compilationUnits, isDynamic ? this.dynamicManager : this.coreManager, getClassPath(), null);
    }

    public MemoryClassLoader getCoreClassLoader()
    {
        return this.coreClassLoader;
    }

    public MemoryClassLoader getClassLoader()
    {
        return this.globalClassLoader;
    }

    public MemoryFileManager getFileManager()
    {
        return this.dynamicManager;
    }

    public MemoryFileManager getCoreFileManager()
    {
        return this.coreManager;
    }

    public void writeClassJavaSourcesToJar(JarOutputStream jarOutputStream) throws IOException
    {
        this.coreManager.writeClassJavaSourcesToJar(jarOutputStream);
        this.dynamicManager.writeClassJavaSourcesToJar(jarOutputStream);
    }

    public void writeClassJavaSources(Path directory, org.finos.legend.pure.runtime.java.compiled.generation.orchestrator.Log log) throws IOException
    {
        this.coreManager.writeClassJavaSources(directory, log);
        this.dynamicManager.writeClassJavaSources(directory, log);
    }

    public static void compile(JavaCompiler compiler, Iterable<? extends JavaFileObject> compilationUnits, JavaFileManager fileManager) throws PureJavaCompileException
    {
        compile(compiler, compilationUnits, fileManager, getClassPath(), null);
    }

    public static void compile(Iterable<? extends JavaFileObject> compilationUnits, JavaFileManager fileManager, String classPath, Integer sourceVersion) throws PureJavaCompileException
    {
        compile(ToolProvider.getSystemJavaCompiler(), compilationUnits, fileManager, classPath, sourceVersion);
    }

    public static void compile(JavaCompiler compiler, Iterable<? extends JavaFileObject> compilationUnits, JavaFileManager fileManager, String classPath, Integer sourceVersion) throws PureJavaCompileException
    {
        MutableList<String> options = buildCompileOptions(classPath, sourceVersion);
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        JavaCompiler.CompilationTask task = compiler.getTask(null, fileManager, diagnostics, options, null, compilationUnits);
        if (!task.call())
        {
            throw new PureJavaCompileException(diagnostics);
        }
    }

    private static MutableList<String> buildCompileOptions(String classPath, Integer sourceVersion)
    {
        MutableList<String> options = Lists.mutable.empty();

        if ((classPath != null) && !classPath.isEmpty())
        {
            options.with("-classpath").with(classPath);
        }

        if ((sourceVersion != null) && (sourceVersion < 7))
        {
            throw new IllegalArgumentException("Source version must be at least 7, got:" + sourceVersion);
        }

        String version = (sourceVersion == null) ? "21" : sourceVersion.toString();

        if (getCurrentJavaVersion() <= 8)
        {
            options.with("-source").with(version)
                  .with("-target").with(version);
        }
        else
        {
            options.with("--release").with(version);
        }

        options.add("-XDuseUnsharedTable=true");
        return options;
    }

    private static int getCurrentJavaVersion()
    {
        return javax.lang.model.SourceVersion.latest().ordinal();
    }

    private static String getClassPath()
    {
        return CLASSPATH_CACHE.computeIfAbsent(Thread.currentThread().getContextClassLoader(), classLoader -> new ClassGraph().getClasspath());
    }
}
