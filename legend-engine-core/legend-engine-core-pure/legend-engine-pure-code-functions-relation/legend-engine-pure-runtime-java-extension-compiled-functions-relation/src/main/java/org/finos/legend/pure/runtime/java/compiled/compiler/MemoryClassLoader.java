//
//
//

package org.finos.legend.pure.runtime.java.compiled.compiler;

/**
 * Custom ClassLoader implementation for Java 21 compatibility
 */
public class MemoryClassLoader extends ClassLoader
{
    private final ClassLoader parent;

    public MemoryClassLoader(ClassLoader parent)
    {
        super(parent);
        this.parent = parent;
    }
}
